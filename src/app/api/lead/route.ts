import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getDb, schema as t } from "@/db";
import { audit } from "@/lib/audit";
import { getTrainer } from "@/lib/content";

/**
 * Lead capture endpoint.
 *
 * Validates the submission, rejects bots via a honeypot, then emails the lead
 * to the trainer. Email is sent only when SMTP credentials are configured;
 * otherwise the lead is logged server-side and we still return 200 so the
 * client UX works during development / before the email service is connected.
 *
 * Required env for live email (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_TO_EMAIL (optional)
 */

interface LeadPayload {
  goal?: string;
  level?: string;
  name?: string;
  whatsapp?: string;
  email?: string;
  preferredDateTime?: string;
  message?: string;
  company?: string; // honeypot
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this.
  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }); // silently accept + drop
  }

  const name = (body.name || "").trim();
  const whatsapp = (body.whatsapp || "").replace(/\s+/g, "");
  const digits = whatsapp.replace(/\D/g, "");

  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (digits.length < 10) {
    return NextResponse.json(
      { error: "Please enter a valid WhatsApp number." },
      { status: 400 },
    );
  }
  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const lead = {
    name,
    whatsapp,
    email: body.email?.trim() || "—",
    goal: body.goal || "—",
    level: body.level || "—",
    preferredDateTime: body.preferredDateTime || "—",
    message: body.message?.trim() || "—",
    receivedAt: new Date().toISOString(),
  };

  // Persist first — a lead must never be lost to an email failure.
  try {
    const result = getDb()
      .insert(t.leads)
      .values({
        name,
        whatsapp,
        email: body.email?.trim() || null,
        goal: body.goal || null,
        level: body.level || null,
        preferredDatetime: body.preferredDateTime || null,
        message: body.message?.trim() || null,
        createdAt: lead.receivedAt,
      })
      .run();
    audit({
      actor: "public",
      action: "lead",
      entityType: "lead",
      entityId: Number(result.lastInsertRowid),
      after: lead,
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent"),
    });
  } catch (err) {
    console.error("[lead] DB persist failed:", err);
  }

  const trainer = await getTrainer();
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const to = process.env.LEAD_TO_EMAIL || trainer.email;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      await transporter.sendMail({
        from: `"FITIZENS Website" <${SMTP_USER}>`,
        to,
        replyTo: body.email || undefined,
        subject: `New consultation lead — ${lead.name}`,
        text: [
          `New lead from the FITIZENS website:`,
          ``,
          `Name: ${lead.name}`,
          `WhatsApp: ${lead.whatsapp}`,
          `Email: ${lead.email}`,
          `Goal: ${lead.goal}`,
          `Level: ${lead.level}`,
          `Preferred date/time: ${lead.preferredDateTime}`,
          `Message: ${lead.message}`,
          ``,
          `Received: ${lead.receivedAt}`,
        ].join("\n"),
      });
    } catch (err) {
      // Lead is already saved in the DB (visible in /admin/leads) — email is
      // best-effort, so the visitor still gets a success response.
      console.error("[lead] email send failed (lead saved to DB):", err);
    }
  } else {
    // No SMTP configured yet — log so nothing is lost during setup.
    console.info("[lead] SMTP not configured. Lead payload:", lead);
  }

  return NextResponse.json({ ok: true });
}
