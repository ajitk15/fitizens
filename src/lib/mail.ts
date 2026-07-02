import "server-only";
import nodemailer from "nodemailer";
import { getTrainer } from "./content";

/**
 * Best-effort email. Sends to the recipient and optionally notifies the
 * trainer. Degrades gracefully: without SMTP config it only logs — callers
 * never fail because email is unavailable.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  /** If set, also sends this short note to the trainer/owner. */
  notifyOwner?: string;
}): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  const trainer = await getTrainer();
  const owner = process.env.LEAD_TO_EMAIL || trainer.email;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.info(`[mail] SMTP not configured — would send "${opts.subject}" to ${opts.to}`);
    if (opts.notifyOwner) console.info(`[mail] owner note: ${opts.notifyOwner}`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transporter.sendMail({
      from: `"FITIZENS" <${SMTP_USER}>`,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
    if (opts.notifyOwner) {
      await transporter.sendMail({
        from: `"FITIZENS Website" <${SMTP_USER}>`,
        to: owner,
        subject: `[FITIZENS] ${opts.subject}`,
        text: opts.notifyOwner,
      });
    }
  } catch (err) {
    console.error("[mail] send failed:", err);
  }
}
