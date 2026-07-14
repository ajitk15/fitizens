import "server-only";

/**
 * Sends the trainer a WhatsApp notification directly through Meta WhatsApp
 * Cloud API when a paid consultation is booked. Best-effort: missing config
 * or API failure is logged but never blocks the booking confirmation.
 *
 * Required env:
 * - META_WHATSAPP_ACCESS_TOKEN
 * - META_WHATSAPP_PHONE_NUMBER_ID
 *
 * Optional env:
 * - META_WHATSAPP_TO — trainer recipient number in E.164, digits only or +prefixed.
 *   Falls back to the trainer WhatsApp number from admin settings when passed.
 * - META_WHATSAPP_TEMPLATE_NAME — defaults to booking_confirmation_trainer.
 * - META_WHATSAPP_TEMPLATE_LANGUAGE — defaults to en_US.
 * - META_GRAPH_API_VERSION — defaults to v23.0.
 */

export interface BookingWhatsAppPayload {
  bookingId: number;
  name: string;
  /** Client's WhatsApp number in E.164, e.g. +919876543210. */
  whatsapp: string;
  email: string | null;
  goal: string | null;
  level: string | null;
  amountPaise: number | null;
  currency: string | null;
  calendlyEventUri: string | null;
  bookedAt: string;
  trainerWhatsapp?: string | null;
}

function cleanPhone(value?: string | null) {
  return value?.replace(/\D/g, "") ?? "";
}

function textParam(value: string | number | null | undefined) {
  const text = value === null || value === undefined || value === "" ? "—" : String(value);
  return { type: "text", text: text.slice(0, 1024) };
}

function amountLabel(amountPaise: number | null, currency: string | null) {
  if (!amountPaise) return "—";
  const amount = amountPaise / 100;
  if ((currency || "INR") === "INR") return `₹${amount.toLocaleString("en-IN")}`;
  return `${currency || ""} ${amount.toLocaleString("en-IN")}`.trim();
}

function formatBookedAt(value: string) {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Kolkata",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export async function notifyTrainerOnWhatsApp(payload: BookingWhatsAppPayload): Promise<void> {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID?.trim();
  const to = cleanPhone(process.env.META_WHATSAPP_TO) || cleanPhone(payload.trainerWhatsapp);

  if (!accessToken || !phoneNumberId || !to) {
    console.info("[whatsapp] Meta WhatsApp config incomplete — skipping trainer notification");
    return;
  }

  const version = process.env.META_GRAPH_API_VERSION?.trim() || "v23.0";
  const templateName = process.env.META_WHATSAPP_TEMPLATE_NAME?.trim() || "booking_confirmation_trainer";
  const templateLanguage = process.env.META_WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "en_US";
  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  const bodyParameters = [
    textParam(`#${payload.bookingId}`),
    textParam(payload.name),
    textParam(payload.whatsapp),
    textParam(payload.email),
    textParam(payload.goal),
    textParam(payload.level),
    textParam(amountLabel(payload.amountPaise, payload.currency)),
    textParam(payload.calendlyEventUri),
    textParam(formatBookedAt(payload.bookedAt)),
  ];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLanguage },
          components: [
            {
              type: "body",
              parameters: bodyParameters,
            },
          ],
        },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const details = await res.text().catch(() => "");
      console.error(`[whatsapp] trainer notification failed: ${res.status} ${details}`);
    }
  } catch (err) {
    console.error("[whatsapp] trainer notification error:", err);
  }
}
