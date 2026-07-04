"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema as t } from "@/db";
import { auditedMutation } from "@/lib/admin";
import { str, num, lines } from "@/lib/forms";

interface StatInput {
  label?: unknown;
  value?: unknown;
  suffix?: unknown;
  prefix?: unknown;
}

/** Parses the StatsEditor's JSON payload defensively — bad rows are dropped. */
function parseStats(raw: string) {
  try {
    const arr = JSON.parse(raw) as StatInput[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((s) => typeof s.label === "string" && s.label.trim() && Number.isFinite(Number(s.value)))
      .slice(0, 12)
      .map((s, i) => ({
        label: String(s.label).trim().slice(0, 60),
        value: Number(s.value),
        suffix: typeof s.suffix === "string" && s.suffix ? s.suffix.slice(0, 4) : null,
        prefix: typeof s.prefix === "string" && s.prefix ? s.prefix.slice(0, 4) : null,
        displayOrder: i,
      }));
  } catch {
    return [];
  }
}

/** Parses the GalleryEditor's JSON payload — only site-local image paths pass. */
function parseGallery(raw: string): string[] {
  try {
    const arr = JSON.parse(raw) as unknown[];
    if (!Array.isArray(arr)) return [];
    return arr
      .filter((p): p is string => typeof p === "string" && (p.startsWith("/uploads/") || p.startsWith("/images/")))
      .slice(0, 24);
  } catch {
    return [];
  }
}

export async function updateTrainerAction(formData: FormData) {
  const db = getDb();
  const statRows = parseStats(String(formData.get("stats") ?? "[]"));
  const gallery = parseGallery(String(formData.get("galleryImages") ?? "[]"));

  await auditedMutation({
    action: "update",
    entityType: "trainer",
    before: () => ({
      trainer: db.select().from(t.trainer).where(eq(t.trainer.id, 1)).get(),
      stats: db.select().from(t.stats).all(),
    }),
    run: () => {
      db.update(t.trainer)
        .set({
          fullName: str(formData, "fullName"),
          brand: str(formData, "brand"),
          tagline: str(formData, "tagline"),
          shortBio: str(formData, "shortBio"),
          bioJson: lines(formData, "bio"),
          philosophy: str(formData, "philosophy"),
          yearsExperience: num(formData, "yearsExperience"),
          location: str(formData, "location"),
          email: str(formData, "email"),
          whatsapp: str(formData, "whatsapp").replace(/\D/g, ""),
          certificationsJson: lines(formData, "certifications"),
          certificateImage: str(formData, "certificateImage") || null,
          profileImage: str(formData, "profileImage"),
          galleryImagesJson: JSON.stringify(gallery),
        })
        .where(eq(t.trainer.id, 1))
        .run();
      if (statRows.length) {
        db.delete(t.stats).run();
        db.insert(t.stats).values(statRows).run();
      }
    },
    entityId: () => 1,
    after: () => ({
      trainer: db.select().from(t.trainer).where(eq(t.trainer.id, 1)).get(),
      stats: db.select().from(t.stats).all(),
    }),
  });
  redirect("/admin/trainer?saved=1");
}
