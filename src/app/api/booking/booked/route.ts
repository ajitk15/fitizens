import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { audit } from "@/lib/audit";

/**
 * Marks a booking `booked` once the client schedules a Calendly slot (the
 * embed fires `calendly.event_scheduled`). Only advances a paid booking, so a
 * spoofed call can't skip payment.
 */
export async function POST(request: Request) {
  let body: { bookingId?: number; calendlyEventUri?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const bookingId = Number(body.bookingId);
  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    return NextResponse.json({ error: "Missing booking." }, { status: 400 });
  }

  const db = getDb();
  const booking = db.select().from(t.leads).where(eq(t.leads.id, bookingId)).get();
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  if (booking.stage === "booked") {
    return NextResponse.json({ ok: true }); // idempotent
  }
  if (booking.stage !== "paid") {
    return NextResponse.json({ error: "Booking is not paid." }, { status: 409 });
  }

  const uri = typeof body.calendlyEventUri === "string" ? body.calendlyEventUri.slice(0, 500) : null;
  db.update(t.leads)
    .set({ stage: "booked", bookedAt: new Date().toISOString(), calendlyEventUri: uri })
    .where(eq(t.leads.id, bookingId))
    .run();
  audit({
    actor: "public",
    action: "booking_booked",
    entityType: "lead",
    entityId: bookingId,
    after: { calendlyEventUri: uri },
    ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
  });

  return NextResponse.json({ ok: true });
}
