/**
 * One-time content migration: pushes the bundled defaults from
 * src/content/site.ts (and the four /public/images photos) into Sanity, so the
 * client starts editing real content instead of an empty Studio.
 *
 * Run once after creating the Sanity project and setting env vars:
 *
 *   npx tsx scripts/seed.ts
 *
 * Requires in .env.local (auto-loaded below):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 *   NEXT_PUBLIC_SANITY_API_VERSION, SANITY_API_WRITE_TOKEN
 *
 * Idempotent: documents use deterministic _ids, so re-running updates in place.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@sanity/client";
import {
  trainer,
  stats,
  programs,
  consultation,
  transformations,
  testimonials,
  faqs,
  socials,
  site,
} from "../src/content/site";

// Minimal .env.local loader (avoids a dotenv dependency).
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN. " +
      "Set them in .env.local before seeding.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
  token,
  useCdn: false,
});

/** Upload a /public image once, returning a Sanity image reference. */
const assetCache = new Map<string, string>();
async function imageRef(publicPath: string) {
  if (assetCache.has(publicPath)) {
    return { _type: "image", asset: { _type: "reference", _ref: assetCache.get(publicPath)! } };
  }
  const filePath = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
  const asset = await client.assets.upload("image", readFileSync(filePath), {
    filename: publicPath.split("/").pop(),
  });
  assetCache.set(publicPath, asset._id);
  return { _type: "image", asset: { _type: "reference", _ref: asset._id } };
}

async function main() {
  console.log("Seeding Sanity dataset:", dataset);

  // Singletons (deterministic ids matched by src/sanity/structure.ts)
  await client.createOrReplace({
    _id: "trainer",
    _type: "trainer",
    fullName: trainer.fullName,
    brand: trainer.brand,
    tagline: trainer.tagline,
    shortBio: trainer.shortBio,
    bio: trainer.bio,
    philosophy: trainer.philosophy,
    yearsExperience: trainer.yearsExperience,
    location: trainer.location,
    email: trainer.email,
    whatsapp: trainer.whatsapp,
    certifications: trainer.certifications,
    profileImage: await imageRef(trainer.profileImage),
    galleryImages: await Promise.all(
      trainer.galleryImages.map(async (g) => ({ _key: g, ...(await imageRef(g)) })),
    ),
    stats: stats.map((s, i) => ({ _key: `stat-${i}`, ...s })),
  });

  await client.createOrReplace({
    _id: "consultation",
    _type: "consultation",
    ...consultation,
  });

  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteUrl: site.url,
    keywords: site.keywords,
    calendlyUrl: site.calendlyUrl || undefined,
  });

  // Collections
  for (const p of programs) {
    await client.createOrReplace({
      _id: `program-${p.slug}`,
      _type: "program",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      durationLabel: p.durationLabel,
      shortDescription: p.shortDescription,
      fullDescription: p.fullDescription,
      features: p.features,
      goalTags: p.goalTags,
      price: p.price,
      billingPeriod: p.billingPeriod,
      popular: p.popular,
      displayOrder: p.displayOrder,
      image: await imageRef(p.image),
    });
  }

  for (const [i, t] of transformations.entries()) {
    await client.createOrReplace({
      _id: `transformation-${t.id}`,
      _type: "transformation",
      clientName: t.clientName,
      beforeImage: await imageRef(t.beforeImage),
      afterImage: await imageRef(t.afterImage),
      goal: t.goal,
      durationWeeks: t.durationWeeks,
      summary: t.summary,
      consentGiven: t.consentGiven,
      featured: t.featured,
      displayOrder: i + 1,
    });
  }

  for (const [i, q] of testimonials.entries()) {
    await client.createOrReplace({
      _id: `testimonial-${q.id}`,
      _type: "testimonial",
      clientName: q.clientName,
      quote: q.quote,
      rating: q.rating,
      result: q.result,
      featured: q.featured,
      displayOrder: i + 1,
    });
  }

  for (const [i, f] of faqs.entries()) {
    await client.createOrReplace({
      _id: `faq-${i + 1}`,
      _type: "faq",
      question: f.question,
      answer: f.answer,
      category: f.category,
      displayOrder: i + 1,
    });
  }

  for (const [i, s] of socials.entries()) {
    await client.createOrReplace({
      _id: `social-${s.platform.toLowerCase()}`,
      _type: "socialLink",
      platform: s.platform,
      url: s.url,
      handle: s.handle,
      followers: s.followers,
      displayOrder: i + 1,
    });
  }

  console.log("✅ Seed complete. Open /studio to review and publish.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
