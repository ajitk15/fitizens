import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { finalizePaidOrder, markOrderFailed } from "@/lib/payments";

interface WebhookEvent {
  event?: string;
  payload?: {
    payment?: {
      entity?: {
        id?: string;
        order_id?: string;
        error_description?: string;
      };
    };
  };
}

/**
 * Razorpay webhook — safety net for payments where the browser never returned
 * (closed tab, dropped connection). Configure in the Razorpay dashboard with
 * RAZORPAY_WEBHOOK_SECRET and the events payment.captured / payment.failed.
 *
 * The HMAC is computed over the RAW request body — read text first, parse after.
 */
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const payment = event.payload?.payment?.entity;
  const orderId = payment?.order_id;
  const paymentId = payment?.id;

  if (event.event === "payment.captured" && orderId && paymentId) {
    await finalizePaidOrder({ razorpayOrderId: orderId, razorpayPaymentId: paymentId, source: "webhook" });
  } else if (event.event === "payment.failed" && orderId) {
    markOrderFailed(orderId, payment?.error_description || "Payment failed", "webhook");
  }

  // Always 200 for recognized-but-unhandled events so Razorpay doesn't retry forever.
  return NextResponse.json({ ok: true });
}
