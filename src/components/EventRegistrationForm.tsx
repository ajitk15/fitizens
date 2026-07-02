"use client";

import { useState } from "react";
import Script from "next/script";
import type { EventItem } from "@/content/site";
import { Button } from "./Button";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

const inputClass =
  "w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-fg placeholder:text-muted/50 focus:border-accent focus:outline-none";

/**
 * Event registration. Free events confirm immediately; paid events create a
 * pending registration, open Razorpay Checkout, then confirm only after
 * server-side signature verification.
 */
export function EventRegistrationForm({ event }: { event: EventItem }) {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [notice, setNotice] = useState<string | null>(null);
  const paid = event.pricePaise > 0;

  async function verifyPayment(registrationId: number, response: RazorpayResponse) {
    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...response, registrationId }),
    });
    const data = await res.json();
    if (res.ok && data.verified) {
      setState("done");
      setNotice("Payment confirmed — you're registered! Check your email for the receipt.");
    } else {
      setState("idle");
      setNotice(
        "We received a payment response but could not verify it. If you were charged, contact me on WhatsApp with your payment ID.",
      );
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setState("busy");
    setNotice(null);

    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug: event.slug,
          name: fd.get("name"),
          email: fd.get("email"),
          whatsapp: fd.get("whatsapp"),
          company: fd.get("company"), // honeypot
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("idle");
        setNotice(data.error || "Something went wrong. Please try again.");
        return;
      }

      if (!data.requiresPayment) {
        setState("done");
        setNotice("You're registered! Check your email for the details.");
        return;
      }

      // Paid event → create a Razorpay order and open checkout.
      const orderRes = await fetch("/api/payment/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "event",
          registrationId: data.registrationId,
          customer: { name: fd.get("name"), email: fd.get("email"), phone: fd.get("whatsapp") },
        }),
      });
      const order = await orderRes.json();
      if (!order.enabled) {
        setState("idle");
        setNotice(
          "Online payment is being set up. Your seat is held — I'll contact you with payment details.",
        );
        return;
      }
      if (!orderRes.ok || !order.orderId || !window.Razorpay) {
        setState("idle");
        setNotice(order.error || "Payment could not start. Please try again or use WhatsApp.");
        return;
      }

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "FITIZENS",
        description: event.title,
        order_id: order.orderId,
        prefill: {
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          contact: String(fd.get("whatsapp") ?? ""),
        },
        handler: (response: RazorpayResponse) => {
          void verifyPayment(data.registrationId, response);
        },
        modal: {
          ondismiss: () => {
            setState("idle");
            setNotice("Payment cancelled. Your seat is held for a short while — try again anytime.");
          },
        },
        theme: { color: "#ff5722" },
      });
      rzp.open();
    } catch {
      setState("idle");
      setNotice("Something went wrong. Please try again or reach out on WhatsApp.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-accent/40 bg-ink-card p-6 shadow-glow sm:p-8">
        <h3 className="font-display text-2xl uppercase">See you there! 🎉</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">{notice}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-ink-card p-6 sm:p-8">
      {paid && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />}
      <h3 className="font-display text-2xl uppercase">Register</h3>
      <p className="mt-2 text-sm text-muted">
        {paid
          ? `₹${(event.pricePaise / 100).toLocaleString("en-IN")} · pay online to confirm your seat.`
          : "Free event — reserve your seat."}
      </p>
      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {/* Honeypot */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Name</span>
          <input name="name" required minLength={2} className={inputClass} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">Email</span>
          <input name="email" type="email" required className={inputClass} placeholder="you@email.com" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">WhatsApp</span>
          <input name="whatsapp" required className={inputClass} placeholder="+91 …" />
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={state === "busy"}>
          {state === "busy"
            ? "Please wait…"
            : paid
              ? `Pay ₹${(event.pricePaise / 100).toLocaleString("en-IN")} & Register`
              : "Reserve my seat"}
        </Button>
      </form>
      {notice && (
        <p className="mt-4 rounded-lg border border-line bg-ink p-3 text-sm text-muted">{notice}</p>
      )}
    </div>
  );
}
