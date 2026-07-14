import "server-only";

/**
 * Booking-confirmed webhook — fires a JSON POST to an external automation
 * (e.g. a Zapier "Catch Hook" that sends the trainer a WhatsApp message).
 * Best-effort: no-op when the URL isn't configured, and never throws so it
 * can't break the booking it reports.
 *
 * Configure with ZAPIER_BOOKING_WEBHOOK_URL (see .env.example).
 */

export interface BookingWebhookPayload {
  event: "booking.confirmed";
  bookingId: number;
  name: string;
  /** Client's WhatsApp number in E.164, e.g. +919876543210. */
  whatsapp: string;
  email: string | null;
  goal: string | null;
  level: string | null;
  calendlyEventUri: string | null;
  bookedAt: string;
}

export async function notifyBookingWebhook(payload: BookingWebhookPayload): Promise<void> {
  // Trim to defend against a trailing newline/CR in the env value (CRLF files),
  // which would otherwise corrupt the URL and 404.
  const url = process.env.ZAPIER_BOOKING_WEBHOOK_URL?.trim();
  if (!url) {
    console.info("[webhook] ZAPIER_BOOKING_WEBHOOK_URL not set — skipping booking notification");
    return;
  }
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`[webhook] booking notification failed: ${res.status}`);
    }
  } catch (err) {
    console.error("[webhook] booking notification error:", err);
  }
}
