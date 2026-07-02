import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Razorpay REST integration — no SDK, just fetch + HMAC (node:crypto).
 * Docs: https://razorpay.com/docs/api/orders/
 */

export function razorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export function razorpayKeyId(): string {
  return process.env.RAZORPAY_KEY_ID ?? "";
}

export async function createRazorpayOrder(opts: {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string }> {
  const keyId = process.env.RAZORPAY_KEY_ID!;
  const keySecret = process.env.RAZORPAY_KEY_SECRET!;
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: opts.amountPaise,
      currency: opts.currency,
      receipt: opts.receipt,
      notes: opts.notes,
    }),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Razorpay order failed (${res.status}): ${detail}`);
  }
  return (await res.json()) as { id: string; amount: number; currency: string };
}

const safeEqualHex = (aHex: string, bHex: string): boolean => {
  const a = Buffer.from(aHex, "hex");
  const b = Buffer.from(bHex, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
};

/** Checkout signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyPaymentSignature(opts: {
  orderId: string;
  paymentId: string;
  signature: string;
}): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret)
    .update(`${opts.orderId}|${opts.paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, opts.signature);
}

/** Webhook signature: HMAC-SHA256(raw request body, webhook_secret). */
export function verifyWebhookSignature(rawBody: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
