import "server-only";
import { eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { audit } from "@/lib/audit";
import { sendMail } from "@/lib/mail";

/**
 * Marks an order paid and finalizes what it bought (confirms the event
 * registration, sends receipts, audits). Idempotent — called from both
 * /api/payment/verify (browser) and /api/payment/webhook (Razorpay server),
 * whichever lands first wins and the second is a no-op.
 */
export async function finalizePaidOrder(opts: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  source: "verify" | "webhook";
}): Promise<{ ok: boolean; already?: boolean }> {
  const db = getDb();
  const order = db
    .select()
    .from(t.orders)
    .where(eq(t.orders.razorpayOrderId, opts.razorpayOrderId))
    .get();
  if (!order) return { ok: false };
  if (order.status === "paid") return { ok: true, already: true };

  const now = new Date().toISOString();
  db.update(t.orders)
    .set({ status: "paid", razorpayPaymentId: opts.razorpayPaymentId, updatedAt: now, error: null })
    .where(eq(t.orders.id, order.id))
    .run();

  let receiptLine = "Consultation call booking";
  if (order.kind === "event" && order.registrationId) {
    const reg = db
      .select()
      .from(t.eventRegistrations)
      .where(eq(t.eventRegistrations.id, order.registrationId))
      .get();
    if (reg) {
      db.update(t.eventRegistrations)
        .set({ status: "confirmed", orderId: order.id })
        .where(eq(t.eventRegistrations.id, reg.id))
        .run();
      const event = db.select().from(t.events).where(eq(t.events.id, reg.eventId)).get();
      if (event) {
        receiptLine = `Event registration: ${event.title} — ${new Date(event.startAt).toLocaleString("en-IN")}`;
      }
    }
  }

  audit({
    actor: opts.source === "webhook" ? "system" : "public",
    action: "payment_paid",
    entityType: "order",
    entityId: order.id,
    before: { status: order.status },
    after: {
      status: "paid",
      razorpayOrderId: opts.razorpayOrderId,
      razorpayPaymentId: opts.razorpayPaymentId,
      amountPaise: order.amountPaise,
      source: opts.source,
    },
  });

  if (order.customerEmail) {
    await sendMail({
      to: order.customerEmail,
      subject: "Payment received — FITIZENS",
      text: [
        `Hi ${order.customerName ?? ""},`.trim() + ",",
        ``,
        `Your payment of ₹${(order.amountPaise / 100).toLocaleString("en-IN")} is confirmed.`,
        receiptLine,
        ``,
        `Payment ID: ${opts.razorpayPaymentId}`,
        `Order ID: ${opts.razorpayOrderId}`,
        ``,
        `— FITIZENS`,
      ].join("\n"),
      notifyOwner: `Payment received: ₹${(order.amountPaise / 100).toLocaleString("en-IN")} — ${receiptLine} — ${order.customerName ?? ""} (${order.customerEmail})`,
    });
  }
  return { ok: true };
}

/** Records a failed payment attempt on the order (idempotent-safe). */
export function markOrderFailed(razorpayOrderId: string, reason: string, source: "verify" | "webhook"): void {
  const db = getDb();
  const order = db.select().from(t.orders).where(eq(t.orders.razorpayOrderId, razorpayOrderId)).get();
  if (!order || order.status === "paid") return;
  db.update(t.orders)
    .set({ status: "failed", error: reason, updatedAt: new Date().toISOString() })
    .where(eq(t.orders.id, order.id))
    .run();
  audit({
    actor: source === "webhook" ? "system" : "public",
    action: "payment_failed",
    entityType: "order",
    entityId: order.id,
    after: { razorpayOrderId, reason, source },
  });
}
