"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema as t } from "@/db";
import { auditedMutation } from "@/lib/admin";
import { str, num, lines } from "@/lib/forms";
import { DAYS, HIDEABLE_PAGES } from "@/lib/constants";

/** Server-side guards — the pickers constrain input, but never trust the client. */
const day = (fd: FormData, key: string, fb: string) => {
  const v = str(fd, key);
  return (DAYS as readonly string[]).includes(v) ? v : fb;
};
const time = (fd: FormData, key: string, fb: string) => {
  const v = str(fd, key);
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : fb;
};

/** Only absolute http(s) URLs are stored — bad values would break site metadata. */
function normalizeSiteUrl(raw: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.origin;
  } catch {
    return null;
  }
}

/** Full http(s) URL incl. path (Calendly links carry the schedule in the path). */
function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

export async function saveSettingsAction(formData: FormData) {
  const db = getDb();
  await auditedMutation({
    action: "update",
    entityType: "site_settings",
    before: () => ({
      settings: db.select().from(t.siteSettings).where(eq(t.siteSettings.id, 1)).get(),
      consultation: db.select().from(t.consultation).where(eq(t.consultation.id, 1)).get(),
    }),
    run: () => {
      db.update(t.siteSettings)
        .set({
          siteUrl: normalizeSiteUrl(str(formData, "siteUrl")),
          keywordsJson: lines(formData, "keywords"),
          ctaLabel: str(formData, "ctaLabel") || "Book a Consultation",
          calendlyUrl: normalizeUrl(str(formData, "calendlyUrl")),
          heroHeadline: str(formData, "heroHeadline") || "Build Better *Health* — Inside and Out.",
          aboutHeading:
            str(formData, "aboutHeading") ||
            "Coaching that's personalized, *science-based* & sustainable.",
          popupEnabled: formData.get("popupEnabled") != null,
          popupTitle: str(formData, "popupTitle"),
          popupBody: str(formData, "popupBody"),
          popupNote: str(formData, "popupNote"),
          popupDayFrom: day(formData, "popupDayFrom", "Mon"),
          popupDayTo: day(formData, "popupDayTo", "Sat"),
          popupTimeFrom: time(formData, "popupTimeFrom", "16:00"),
          popupTimeTo: time(formData, "popupTimeTo", "20:00"),
          // Checked = visible; anything unchecked is stored as hidden.
          hiddenPagesJson: JSON.stringify(
            HIDEABLE_PAGES.filter((p) => formData.get(`page_${p.key}`) == null).map((p) => p.key),
          ),
        })
        .where(eq(t.siteSettings.id, 1))
        .run();
      db.update(t.consultation)
        .set({
          price: num(formData, "price"),
          currency: str(formData, "currency") || "INR",
          durationLabel: str(formData, "durationLabel"),
          note: str(formData, "note"),
        })
        .where(eq(t.consultation.id, 1))
        .run();
    },
    entityId: () => 1,
    after: () => ({
      settings: db.select().from(t.siteSettings).where(eq(t.siteSettings.id, 1)).get(),
      consultation: db.select().from(t.consultation).where(eq(t.consultation.id, 1)).get(),
    }),
  });
  redirect("/admin/settings?saved=1");
}
