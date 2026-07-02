import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/mail";

interface Payload {
  eventSlug?: string;
  name?: string;
  email?: string;
  whatsapp?: string;
  company?: string; // honeypot
}

/**
 * Event registration. Free events → confirmed immediately (+ email).
 * Paid events → pending_payment; the client then creates a Razorpay order and
 * the registration is confirmed by /api/payment/verify (or the webhook).
 */
export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (body.company && body.company.trim() !== "") {
    return NextResponse.json({ ok: true }); // bot — silently drop
  }

  const name = (body.name || "").trim();
  const email = (body.email || "").trim();
  const whatsapp = (body.whatsapp || "").replace(/\s+/g, "");
  if (name.length < 2) {
    return NextResponse.json({ error: "Please enter your name." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }
  if (whatsapp.replace(/\D/g, "").length < 10) {
    return NextResponse.json({ error: "Please enter a valid WhatsApp number." }, { status: 400 });
  }

  const db = getDb();
  const event = db
    .select()
    .from(t.events)
    .where(eq(t.events.slug, String(body.eventSlug ?? "")))
    .get();
  if (!event || event.status !== "published") {
    return NextResponse.json({ error: "Event not found." }, { status: 404 });
  }
  if (new Date(event.startAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "This event has already started." }, { status: 400 });
  }

  // Duplicate guard: one active registration per email per event.
  const existing = db
    .select()
    .from(t.eventRegistrations)
    .where(
      and(eq(t.eventRegistrations.eventId, event.id), eq(t.eventRegistrations.email, email)),
    )
    .all()
    .find((r) => r.status !== "cancelled");
  if (existing) {
    if (existing.status === "confirmed") {
      return NextResponse.json({ error: "You're already registered for this event." }, { status: 409 });
    }
    // pending_payment → let them retry payment with the same registration
    return NextResponse.json({ ok: true, registrationId: existing.id, requiresPayment: true });
  }

  // Capacity check (confirmed seats only).
  if (event.capacity != null) {
    const confirmed = db
      .select()
      .from(t.eventRegistrations)
      .where(
        and(
          eq(t.eventRegistrations.eventId, event.id),
          eq(t.eventRegistrations.status, "confirmed"),
        ),
      )
      .all().length;
    if (confirmed >= event.capacity) {
      return NextResponse.json({ error: "Sorry, this event is sold out." }, { status: 409 });
    }
  }

  const free = event.pricePaise === 0;
  const result = db
    .insert(t.eventRegistrations)
    .values({
      eventId: event.id,
      name,
      email,
      whatsapp,
      status: free ? "confirmed" : "pending_payment",
      createdAt: new Date().toISOString(),
    })
    .run();
  const registrationId = Number(result.lastInsertRowid);

  audit({
    actor: "public",
    action: "register",
    entityType: "event_registration",
    entityId: registrationId,
    after: { event: event.slug, name, email, whatsapp, status: free ? "confirmed" : "pending_payment" },
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
    userAgent: request.headers.get("user-agent"),
  });

  if (free) {
    await sendMail({
      to: email,
      subject: `You're registered: ${event.title}`,
      text: [
        `Hi ${name},`,
        ``,
        `You're registered for ${event.title}.`,
        `When: ${new Date(event.startAt).toLocaleString("en-IN")}`,
        `Where: ${event.mode === "online" ? "Online" : event.location}`,
        ``,
        `See you there!`,
        `— FITIZENS`,
      ].join("\n"),
      notifyOwner: `New registration for ${event.title}: ${name} (${email}, ${whatsapp})`,
    });
  }

  return NextResponse.json({ ok: true, registrationId, requiresPayment: !free });
}
