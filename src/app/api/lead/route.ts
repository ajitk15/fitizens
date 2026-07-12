import { NextResponse } from "next/server";
import { getDb, schema as t } from "@/db";
import { audit } from "@/lib/audit";
import { getTrainer } from "@/lib/content";
import { sendMail } from "@/lib/mail";
import { upsertSubscriber } from "@/lib/newsletter";

/**
 * Consultation enquiry endpoint.
 *
 * Validates the submission, rejects bots via a honeypot, persists the enquiry
 * (visible in /admin/leads) and emails it to the trainer when SMTP is
 * configured. With `subscribe: true` the sender also joins the newsletter.
 */

interface LeadPayload {
  goal?: string;
  level?: string;
  name?: string;
  whatsapp?: string;
  email?: string;
  preferredDateTime?: string;
  message?: string;
  /** Newsletter opt-in from the form checkbox. */
  subscribe?: boolean;
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

  // Newsletter opt-in — requires an email address; never blocks the enquiry.
  if (body.subscribe && body.email) {
    try {
      upsertSubscriber({
        email: body.email,
        name,
        source: "consultation",
        meta: {
          ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
          userAgent: request.headers.get("user-agent"),
        },
      });
    } catch (err) {
      console.error("[lead] newsletter opt-in failed:", err);
    }
  }

  const trainer = await getTrainer();
  const to = process.env.LEAD_TO_EMAIL || trainer.email;
  // Best-effort: the enquiry is already saved in the DB (visible in
  // /admin/leads); without SMTP sendMail just logs.
  await sendMail({
    to,
    subject: `New consultation enquiry — ${lead.name}`,
    text: [
      `New enquiry from the FITIZENS website:`,
      ``,
      `Name: ${lead.name}`,
      `WhatsApp: ${lead.whatsapp}`,
      `Email: ${lead.email}`,
      `Goal: ${lead.goal}`,
      `Level: ${lead.level}`,
      `Preferred date/time: ${lead.preferredDateTime}`,
      `Message: ${lead.message}`,
      `Newsletter opt-in: ${body.subscribe ? "yes" : "no"}`,
      ``,
      `Received: ${lead.receivedAt}`,
    ].join("\n"),
  });

  return NextResponse.json({ ok: true });
}
