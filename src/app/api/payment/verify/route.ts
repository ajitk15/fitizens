import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { finalizePaidOrder, markOrderFailed } from "@/lib/payments";

interface Payload {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
}

/**
 * Server-side confirmation of a Razorpay checkout. The client handler callback
 * is never trusted — only a valid HMAC signature marks an order paid.
 */
export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ verified: false, error: "Invalid request." }, { status: 400 });
  }

  const orderId = body.razorpay_order_id ?? "";
  const paymentId = body.razorpay_payment_id ?? "";
  const signature = body.razorpay_signature ?? "";
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ verified: false, error: "Missing fields." }, { status: 400 });
  }

  if (!verifyPaymentSignature({ orderId, paymentId, signature })) {
    markOrderFailed(orderId, "Signature verification failed", "verify");
    return NextResponse.json({ verified: false, error: "Signature mismatch." }, { status: 400 });
  }

  const result = await finalizePaidOrder({
    razorpayOrderId: orderId,
    razorpayPaymentId: paymentId,
    source: "verify",
  });
  if (!result.ok) {
    return NextResponse.json({ verified: false, error: "Unknown order." }, { status: 404 });
  }
  return NextResponse.json({ verified: true });
}
