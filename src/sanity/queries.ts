import { groq } from "next-sanity";
import { cache } from "react";
import { sanityFetch } from "./client";
import * as fallback from "@/content/site";
import type {
  Trainer,
  Stat,
  Program,
  Transformation,
  Testimonial,
  Faq,
  SocialLink,
  Post,
  PostListItem,
} from "@/content/site";

/* ------------------------------------------------------------------ */
/*  GROQ — images are projected to plain CDN URL strings so the result */
/*  matches the existing TypeScript shapes exactly.                    */
/* ------------------------------------------------------------------ */

const TRAINER_QUERY = groq`*[_type == "trainer"][0]{
  fullName, brand, tagline, shortBio, bio, philosophy, yearsExperience,
  location, email, whatsapp, certifications,
  "profileImage": profileImage.asset->url,
  "galleryImages": galleryImages[].asset->url,
  stats[]{ label, value, suffix, prefix }
}`;

const PROGRAMS_QUERY = groq`*[_type == "program"] | order(displayOrder asc){
  "slug": slug.current, title, durationLabel, shortDescription, fullDescription,
  features, goalTags, price, billingPeriod, popular, displayOrder,
  "image": image.asset->url
}`;

const TRANSFORMATIONS_QUERY = groq`*[_type == "transformation"] | order(displayOrder asc){
  "id": _id, clientName,
  "beforeImage": beforeImage.asset->url,
  "afterImage": afterImage.asset->url,
  goal, durationWeeks, summary, consentGiven, featured
}`;

const TESTIMONIALS_QUERY = groq`*[_type == "testimonial"] | order(displayOrder asc){
  "id": _id, clientName, "image": image.asset->url, quote, rating, result, featured
}`;

const FAQS_QUERY = groq`*[_type == "faq"] | order(displayOrder asc){ question, answer, category }`;

const SOCIALS_QUERY = groq`*[_type == "socialLink"] | order(displayOrder asc){ platform, url, handle, followers }`;

const CONSULTATION_QUERY = groq`*[_type == "consultation"][0]{ price, currency, durationLabel, note }`;

const SITE_SETTINGS_QUERY = groq`*[_type == "siteSettings"][0]{ siteUrl, keywords, calendlyUrl }`;

/* ------------------------------------------------------------------ */
/*  Getters — Sanity first, bundled defaults as fallback.             */
/*  `cache()` dedupes calls within a single request/render.           */
/* ------------------------------------------------------------------ */

export const getTrainer = cache(async (): Promise<Trainer> => {
  const data = await sanityFetch<Partial<Trainer>>(TRAINER_QUERY);
  if (!data) return fallback.trainer;
  return {
    ...fallback.trainer,
    ...data,
    // Never hand next/image an empty src.
    profileImage: data.profileImage || fallback.trainer.profileImage,
    galleryImages: data.galleryImages?.length
      ? data.galleryImages
      : fallback.trainer.galleryImages,
  };
});

export const getStats = cache(async (): Promise<Stat[]> => {
  const data = await sanityFetch<{ stats?: Stat[] }>(
    groq`*[_type == "trainer"][0]{ stats[]{ label, value, suffix, prefix } }`,
  );
  return data?.stats?.length ? data.stats : fallback.stats;
});

export const getPrograms = cache(async (): Promise<Program[]> => {
  const data = await sanityFetch<Partial<Program>[]>(PROGRAMS_QUERY);
  if (!data) return fallback.programs;
  return data.map((p, i) => ({
    ...fallback.programs[i % fallback.programs.length],
    ...p,
    currency: p.currency || "INR",
    image: p.image || fallback.programs[i % fallback.programs.length].image,
  })) as Program[];
});

export const getProgram = cache(async (slug: string): Promise<Program | undefined> => {
  const programs = await getPrograms();
  return programs.find((p) => p.slug === slug);
});

export const getTransformations = cache(async (): Promise<Transformation[]> => {
  const data = await sanityFetch<Transformation[]>(TRANSFORMATIONS_QUERY);
  return data ?? fallback.transformations;
});

export const getTestimonials = cache(async (): Promise<Testimonial[]> => {
  const data = await sanityFetch<Testimonial[]>(TESTIMONIALS_QUERY);
  return data ?? fallback.testimonials;
});

export const getFaqs = cache(async (): Promise<Faq[]> => {
  const data = await sanityFetch<Faq[]>(FAQS_QUERY);
  return data ?? fallback.faqs;
});

export const getSocials = cache(async (): Promise<SocialLink[]> => {
  const data = await sanityFetch<SocialLink[]>(SOCIALS_QUERY);
  return data ?? fallback.socials;
});

export const getConsultation = cache(async (): Promise<typeof fallback.consultation> => {
  const data = await sanityFetch<typeof fallback.consultation>(CONSULTATION_QUERY);
  return data ?? fallback.consultation;
});

/**
 * Site-wide config in the same shape as the static `site` object, so layout and
 * metadata can `await getSite()`. CMS settings override the bundled defaults.
 */
export const getSite = cache(async (): Promise<typeof fallback.site> => {
  const [trainer, settings] = await Promise.all([
    getTrainer(),
    sanityFetch<{ siteUrl?: string; keywords?: string[]; calendlyUrl?: string }>(
      SITE_SETTINGS_QUERY,
    ),
  ]);
  return {
    ...fallback.site,
    name: trainer.brand,
    title: `${trainer.brand} — ${trainer.tagline} | ${trainer.fullName}`,
    description: trainer.shortBio,
    url: settings?.siteUrl || fallback.site.url,
    ogImage: trainer.profileImage,
    keywords: settings?.keywords?.length ? settings.keywords : fallback.site.keywords,
    whatsappLink: `https://wa.me/${trainer.whatsapp}`,
    calendlyUrl: settings?.calendlyUrl || fallback.site.calendlyUrl,
  };
});

/* ------------------------------------------------------------------ */
/*  Blog — no bundled fallback (CMS-only); empty until posts exist.    */
/* ------------------------------------------------------------------ */

const POSTS_QUERY = groq`*[_type == "post" && isPublished == true] | order(publishedAt desc){
  "slug": slug.current, title, excerpt, "coverImage": coverImage.asset->url,
  category, tags, readTimeMin, publishedAt
}`;

const POST_QUERY = groq`*[_type == "post" && slug.current == $slug && isPublished == true][0]{
  "slug": slug.current, title, excerpt, "coverImage": coverImage.asset->url,
  category, tags, readTimeMin, publishedAt, body
}`;

export const getPosts = cache(async (): Promise<PostListItem[]> => {
  const data = await sanityFetch<PostListItem[]>(POSTS_QUERY);
  return data ?? [];
});

export const getPost = cache(async (slug: string): Promise<Post | null> => {
  const data = await sanityFetch<Post>(POST_QUERY, { slug });
  return data ?? null;
});
