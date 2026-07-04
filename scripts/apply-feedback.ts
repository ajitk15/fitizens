/**
 * One-off: push the client-feedback content updates from src/content/site.ts
 * into the live SQLite DB (which otherwise keeps the already-seeded copy).
 * Safe to re-run — it only overwrites the specific fields that changed.
 */
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as defaults from "../src/content/site";

const db = new Database("data/fitizens.db");
db.pragma("busy_timeout = 5000");

// Apply any pending schema migrations (e.g. certificate_image) before writing.
migrate(drizzle(db), { migrationsFolder: "drizzle" });

// Trainer bio / philosophy / certifications / short bio / certificate image
db.prepare(
  `UPDATE trainer SET short_bio = ?, bio_json = ?, philosophy = ?, certifications_json = ?, certificate_image = ? WHERE id = 1`,
).run(
  defaults.trainer.shortBio,
  JSON.stringify(defaults.trainer.bio),
  defaults.trainer.philosophy,
  JSON.stringify(defaults.trainer.certifications),
  defaults.trainer.certificateImage ?? null,
);

// Programs — full descriptions + the shared "what's included" features
const updProgram = db.prepare(
  `UPDATE programs SET full_description = ?, features_json = ? WHERE slug = ?`,
);
for (const p of defaults.programs) {
  updProgram.run(p.fullDescription, JSON.stringify(p.features), p.slug);
}

// Consultation note
db.prepare(`UPDATE consultation SET note = ? WHERE id = 1`).run(
  defaults.consultation.note,
);

// FAQ answers (match on question text)
const updFaq = db.prepare(`UPDATE faqs SET answer = ? WHERE question = ?`);
for (const f of defaults.faqs) {
  updFaq.run(f.answer, f.question);
}

console.info("[apply-feedback] DB updated from src/content/site.ts defaults.");
db.close();
