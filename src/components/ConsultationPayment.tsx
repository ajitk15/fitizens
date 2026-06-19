"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "./Button";
import { consultation } from "@/content/site";

/**
 * Razorpay consultation-payment button.
 *
 * Built in placeholder/test mode: it asks the server (/api/payment) to create an
 * order. Until a live Razorpay key is configured the server returns
 * { enabled:false }, and we show a friendly "payments coming soon" notice
 * instead of opening checkout. When keys exist, the Razorpay Checkout modal
 * opens with the created order.
 *
 * TODO (go-live): set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (server) and
 * NEXT_PUBLIC_RAZORPAY_KEY_ID (client) — see .env.example.
 */

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function ConsultationPayment() {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/payment", { method: "POST" });
      const data = await res.json();

      if (!data.enabled) {
        setNotice(
          "Online payment is being set up. For now, book your call via the form or WhatsApp and I'll share payment details.",
        );
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!window.Razorpay || !keyId) {
        setNotice("Payment could not start. Please try WhatsApp for now.");
        return;
      }

      const rzp = new window.Razorpay({
        key: keyId,
        amount: data.amount,
        currency: data.currency,
        name: "FITIZENS",
        description: `Consultation Call (${consultation.durationLabel})`,
        order_id: data.orderId,
        handler: (response: RazorpayResponse) => {
          // TODO: verify signature server-side at /api/payment/verify before confirming.
          setNotice(
            `Payment received (${response.razorpay_payment_id}). I'll be in touch to schedule your call!`,
          );
        },
        theme: { color: "#ff5722" },
      });
      rzp.open();
    } catch {
      setNotice("Something went wrong starting payment. Please try WhatsApp.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-ink-card p-6 sm:p-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <h3 className="font-display text-2xl uppercase">Pay & book your call</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Consultation call · {consultation.durationLabel}
      </p>
      <p className="mt-4 font-display text-4xl text-accent">
        ₹{consultation.price.toLocaleString("en-IN")}
      </p>
      <p className="mt-3 text-sm text-muted">{consultation.note}</p>

      <Button onClick={handlePay} size="lg" className="mt-6 w-full" disabled={loading}>
        {loading ? "Starting…" : `Pay ₹${consultation.price.toLocaleString("en-IN")} & Book`}
      </Button>

      {notice && (
        <p className="mt-4 rounded-lg border border-line bg-ink p-3 text-sm text-muted">
          {notice}
        </p>
      )}
    </div>
  );
}
