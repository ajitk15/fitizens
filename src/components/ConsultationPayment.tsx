"use client";

import { useState } from "react";
import Script from "next/script";
import { Button } from "./Button";
import { consultation as fallbackConsultation } from "@/content/site";

interface ConsultationPaymentProps {
  /** Consultation details (from the CMS); falls back to bundled defaults. */
  consultation?: { price: number; durationLabel: string; note: string };
}

/**
 * Razorpay consultation-payment button.
 *
 * Asks the server (/api/payment/order) to create an order; until Razorpay keys
 * are configured the server returns { enabled:false } and a friendly
 * "payments coming soon" notice shows instead of checkout. Success is only
 * shown after /api/payment/verify confirms the payment signature server-side.
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

export function ConsultationPayment({ consultation = fallbackConsultation }: ConsultationPaymentProps = {}) {
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function verify(response: RazorpayResponse) {
    try {
      const res = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setNotice(
          `Payment confirmed (${response.razorpay_payment_id}). I'll be in touch to schedule your call!`,
        );
      } else {
        setNotice(
          "We received a payment response but could not verify it. If you were charged, message me on WhatsApp with your payment ID.",
        );
      }
    } catch {
      setNotice("Could not verify the payment. Please message me on WhatsApp.");
    }
  }

  async function handlePay() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "consultation" }),
      });
      const data = await res.json();

      if (!data.enabled) {
        setNotice(
          "Online payment is being set up. For now, book your call via the form or WhatsApp and I'll share payment details.",
        );
        return;
      }

      if (!res.ok || !data.orderId || !window.Razorpay || !data.keyId) {
        setNotice("Payment could not start. Please try WhatsApp for now.");
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "FITIZENS",
        description: `Consultation Call (${consultation.durationLabel})`,
        order_id: data.orderId,
        handler: (response: RazorpayResponse) => {
          void verify(response);
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
      <p className="mt-3 text-sm leading-relaxed text-muted">
        A focused call to discuss your fitness goals, health history, lifestyle
        and the best strategy to help you achieve lasting results.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">{consultation.note}</p>

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
