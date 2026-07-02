import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { audit } from "@/lib/audit";
import { getConsultation } from "@/lib/content";
import { createRazorpayOrder, razorpayConfigured, razorpayKeyId } from "@/lib/razorpay";

interface Payload {
  kind?: "consultation" | "event";
  registrationId?: number;
  customer?: { name?: string; email?: string; phone?: string };
}

/**
 * Creates a Razorpay order. Amounts are always derived server-side (from the
 * consultation price or the event price) — never trusted from the client.
 * Returns { enabled:false } while Razorpay keys are not configured.
 */
export async function POST(request: Request) {
  if (!razorpayConfigured()) {
    return NextResponse.json({ enabled: false });
  }

  let body: Payload;
  try {
    body = await request.json();
  } catch {
    body = { kind: "consultation" };
  }
  const kind = body.kind === "event" ? "event" : "consultation";
  const db = getDb();

  let amountPaise: number;
  let currency = "INR";
  let receipt: string;
  let notes: Record<string, string>;
  let registrationId: number | null = null;

  if (kind === "event") {
    const regId = Number(body.registrationId);
    const reg = regId
      ? db.select().from(t.eventRegistrations).where(eq(t.eventRegistrations.id, regId)).get()
      : undefined;
    if (!reg) {
      return NextResponse.json({ enabled: true, error: "Registration not found." }, { status: 404 });
    }
    if (reg.status === "confirmed") {
      return NextResponse.json({ enabled: true, error: "Already paid." }, { status: 409 });
    }
    const event = db.select().from(t.events).where(eq(t.events.id, reg.eventId)).get();
    if (!event || event.pricePaise <= 0) {
      return NextResponse.json({ enabled: true, error: "Invalid event." }, { status: 400 });
    }
    // Capacity re-check right before taking money — pending registrations don't
    // hold seats, so this closes most of the oversell window.
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
        return NextResponse.json(
          { enabled: true, error: "Sorry, this event just sold out." },
          { status: 409 },
        );
      }
    }
    amountPaise = event.pricePaise;
    currency = event.currency;
    receipt = `event_${event.id}_reg_${reg.id}`;
    notes = { purpose: `Event: ${event.title}`, registrationId: String(reg.id) };
    registrationId = reg.id;
  } else {
    const consultation = await getConsultation();
    amountPaise = consultation.price * 100;
    currency = consultation.currency;
    receipt = `consult_${Date.now()}`;
    notes = { purpose: "Consultation call" };
  }

  try {
    const order = await createRazorpayOrder({ amountPaise, currency, receipt, notes });
    const now = new Date().toISOString();
    const result = db
      .insert(t.orders)
      .values({
        kind,
        registrationId,
        razorpayOrderId: order.id,
        amountPaise,
        currency,
        status: "created",
        customerName: body.customer?.name?.trim() || null,
        customerEmail: body.customer?.email?.trim() || null,
        customerPhone: body.customer?.phone?.trim() || null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    audit({
      actor: "public",
      action: "payment_created",
      entityType: "order",
      entityId: Number(result.lastInsertRowid),
      after: { kind, razorpayOrderId: order.id, amountPaise, currency, registrationId },
      ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request.headers.get("user-agent"),
    });
    return NextResponse.json({
      enabled: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId(),
    });
  } catch (err) {
    console.error("[payment] order creation failed:", err);
    return NextResponse.json({ enabled: true, error: "Order creation failed." }, { status: 502 });
  }
}
