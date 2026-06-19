import { NextResponse } from "next/server";
import { getConsultation } from "@/sanity/queries";

/**
 * Creates a Razorpay order for the consultation fee.
 *
 * STUB / TEST MODE: when RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not set, this
 * returns { enabled: false } and the UI shows a "payments coming soon" notice.
 * Once the client provides live (or test) keys, set them in the environment and
 * this route will create a real order via the Razorpay Orders API.
 *
 * Required env for live payments (see .env.example):
 *   RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 *   NEXT_PUBLIC_RAZORPAY_KEY_ID (client, for Checkout)
 */
export async function POST() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  // Not configured yet — graceful stub.
  if (!keyId || !keySecret) {
    return NextResponse.json({ enabled: false });
  }

  const consultation = await getConsultation();
  const amount = consultation.price * 100; // Razorpay expects paise

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount,
        currency: consultation.currency,
        receipt: `consult_${Date.now()}`,
        notes: { purpose: "Consultation call" },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("[payment] Razorpay order failed:", detail);
      return NextResponse.json({ enabled: true, error: "Order creation failed." }, { status: 502 });
    }

    const order = (await res.json()) as { id: string; amount: number; currency: string };
    return NextResponse.json({
      enabled: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("[payment] error:", err);
    return NextResponse.json({ enabled: true, error: "Payment service error." }, { status: 502 });
  }
}
