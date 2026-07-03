import { cache } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import * as fallback from "@/content/site";
import type {
  Trainer,
  Stat,
  Program,
  Goal,
  Transformation,
  Testimonial,
  Faq,
  SocialLink,
  Post,
  PostListItem,
  EventItem,
} from "@/content/site";

/* ------------------------------------------------------------------ */
/*  SQLite-backed content getters.                                     */
/*                                                                     */
/*  Same names and return types as the old src/sanity/queries.ts, so   */
/*  pages only change their import path. `cache()` dedupes within a    */
/*  request; the bundled defaults in src/content/site.ts remain the    */
/*  fallback if the database is unavailable (keeps `next build` green  */
/*  on machines without a data directory).                             */
/* ------------------------------------------------------------------ */

const json = <T>(s: string, fb: T): T => {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fb;
  }
};

/** Runs a DB read; on any failure returns the bundled fallback. */
function safe<T>(read: () => T, fb: T): T {
  try {
    return read();
  } catch (err) {
    console.error("[content] DB read failed, using bundled defaults:", err);
    return fb;
  }
}

export const getTrainer = cache(async (): Promise<Trainer> =>
  safe(() => {
    const row = getDb().select().from(t.trainer).where(eq(t.trainer.id, 1)).get();
    if (!row) return fallback.trainer;
    return {
      fullName: row.fullName,
      brand: row.brand,
      tagline: row.tagline,
      shortBio: row.shortBio,
      bio: json<string[]>(row.bioJson, fallback.trainer.bio),
      philosophy: row.philosophy,
      yearsExperience: row.yearsExperience,
      location: row.location,
      email: row.email,
      whatsapp: row.whatsapp,
      certifications: json<string[]>(row.certificationsJson, fallback.trainer.certifications),
      profileImage: row.profileImage || fallback.trainer.profileImage,
      galleryImages: json<string[]>(row.galleryImagesJson, fallback.trainer.galleryImages),
    };
  }, fallback.trainer),
);

export const getStats = cache(async (): Promise<Stat[]> =>
  safe(() => {
    const rows = getDb().select().from(t.stats).orderBy(asc(t.stats.displayOrder)).all();
    if (!rows.length) return fallback.stats;
    return rows.map((r) => ({
      label: r.label,
      value: r.value,
      suffix: r.suffix ?? undefined,
      prefix: r.prefix ?? undefined,
    }));
  }, fallback.stats),
);

export const getPrograms = cache(async (): Promise<Program[]> =>
  safe(() => {
    const rows = getDb().select().from(t.programs).orderBy(asc(t.programs.displayOrder)).all();
    if (!rows.length) return fallback.programs;
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      durationLabel: r.durationLabel,
      shortDescription: r.shortDescription,
      fullDescription: r.fullDescription,
      features: json<string[]>(r.featuresJson, []),
      goalTags: json<Goal[]>(r.goalTagsJson, []),
      price: r.price,
      currency: r.currency,
      billingPeriod: r.billingPeriod as Program["billingPeriod"],
      popular: r.popular,
      displayOrder: r.displayOrder,
      image: r.image || fallback.programs[0].image,
    }));
  }, fallback.programs),
);

export const getProgram = cache(async (slug: string): Promise<Program | undefined> => {
  const programs = await getPrograms();
  return programs.find((p) => p.slug === slug);
});

export const getTransformations = cache(async (): Promise<Transformation[]> =>
  safe(() => {
    const rows = getDb()
      .select()
      .from(t.transformations)
      .orderBy(asc(t.transformations.displayOrder))
      .all();
    if (!rows.length) return fallback.transformations;
    return rows.map((r) => ({
      id: String(r.id),
      clientName: r.clientName,
      beforeImage: r.beforeImage,
      afterImage: r.afterImage,
      goal: r.goal as Goal,
      durationWeeks: r.durationWeeks,
      summary: r.summary,
      consentGiven: r.consentGiven,
      featured: r.featured,
      placeholder: r.placeholder || undefined,
    }));
  }, fallback.transformations),
);

export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  safe(() => {
    const rows = getDb()
      .select()
      .from(t.testimonials)
      .orderBy(asc(t.testimonials.displayOrder))
      .all();
    if (!rows.length) return fallback.testimonials;
    return rows.map((r) => ({
      id: String(r.id),
      clientName: r.clientName,
      image: r.image ?? undefined,
      quote: r.quote,
      rating: r.rating,
      result: r.result ?? undefined,
      featured: r.featured,
      placeholder: r.placeholder || undefined,
    }));
  }, fallback.testimonials),
);

export const getFaqs = cache(async (): Promise<Faq[]> =>
  safe(() => {
    const rows = getDb().select().from(t.faqs).orderBy(asc(t.faqs.displayOrder)).all();
    if (!rows.length) return fallback.faqs;
    return rows.map((r) => ({ question: r.question, answer: r.answer, category: r.category }));
  }, fallback.faqs),
);

export const getSocials = cache(async (): Promise<SocialLink[]> =>
  safe(() => {
    const rows = getDb().select().from(t.socials).orderBy(asc(t.socials.displayOrder)).all();
    if (!rows.length) return fallback.socials;
    return rows.map((r) => ({
      platform: r.platform,
      url: r.url,
      handle: r.handle,
      followers: r.followers ?? undefined,
    }));
  }, fallback.socials),
);

export const getConsultation = cache(async (): Promise<typeof fallback.consultation> =>
  safe(() => {
    const row = getDb().select().from(t.consultation).where(eq(t.consultation.id, 1)).get();
    if (!row) return fallback.consultation;
    return {
      price: row.price,
      currency: row.currency,
      durationLabel: row.durationLabel,
      note: row.note,
    };
  }, fallback.consultation),
);

/** "16:00" → "4:00 PM" for the popup's availability line. */
function formatTime12h(hhmm: string): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
  if (!m) return hhmm;
  const h = Number(m[1]);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m[2]} ${suffix}`;
}

/** Composes "Mon–Sat, 4:00 PM – 8:00 PM (IST)" from the structured settings. */
function composeSlots(s: {
  popupDayFrom: string;
  popupDayTo: string;
  popupTimeFrom: string;
  popupTimeTo: string;
}): string {
  const days = s.popupDayFrom === s.popupDayTo ? s.popupDayFrom : `${s.popupDayFrom}–${s.popupDayTo}`;
  return `${days}, ${formatTime12h(s.popupTimeFrom)} – ${formatTime12h(s.popupTimeTo)} (IST)`;
}

/** Accepts only absolute http(s) URLs — anything else would crash metadataBase. */
function validSiteUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return u.protocol === "http:" || u.protocol === "https:" ? u.origin : null;
  } catch {
    return null;
  }
}

/**
 * Site-wide config in the same shape as the static `site` object. DB settings
 * override the bundled defaults; trainer fields feed title/description.
 */
export const getSite = cache(async (): Promise<typeof fallback.site> => {
  const trainer = await getTrainer();
  const settings = safe(() => {
    return getDb().select().from(t.siteSettings).where(eq(t.siteSettings.id, 1)).get() ?? null;
  }, null);
  const keywords = settings ? json<string[]>(settings.keywordsJson, fallback.site.keywords) : fallback.site.keywords;
  return {
    ...fallback.site,
    name: trainer.brand,
    title: `${trainer.brand} — ${trainer.tagline} | ${trainer.fullName}`,
    description: trainer.shortBio,
    url: validSiteUrl(settings?.siteUrl) || fallback.site.url,
    ogImage: trainer.profileImage,
    keywords: keywords.length ? keywords : fallback.site.keywords,
    whatsappLink: `https://wa.me/${trainer.whatsapp}`,
    ctaLabel: settings?.ctaLabel || fallback.site.ctaLabel,
    hiddenPages: settings ? json<string[]>(settings.hiddenPagesJson, []) : [],
    popup: settings
      ? {
          enabled: settings.popupEnabled,
          title: settings.popupTitle || fallback.site.popup.title,
          body: settings.popupBody || fallback.site.popup.body,
          slots: composeSlots(settings),
          note: settings.popupNote || fallback.site.popup.note,
        }
      : fallback.site.popup,
  };
});

/* ------------------------------------------------------------------ */
/*  Blog — DB-only; empty until posts exist.                           */
/* ------------------------------------------------------------------ */

export const getPosts = cache(async (): Promise<PostListItem[]> =>
  safe(() => {
    const rows = getDb()
      .select()
      .from(t.posts)
      .where(eq(t.posts.isPublished, true))
      .orderBy(desc(t.posts.publishedAt))
      .all();
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      coverImage: r.coverImage ?? undefined,
      category: r.category ?? undefined,
      tags: json<string[]>(r.tagsJson, []),
      readTimeMin: r.readTimeMin ?? undefined,
      publishedAt: r.publishedAt,
    }));
  }, []),
);

export const getPost = cache(async (slug: string): Promise<Post | null> =>
  safe(() => {
    const r = getDb().select().from(t.posts).where(eq(t.posts.slug, slug)).get();
    if (!r || !r.isPublished) return null;
    return {
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt,
      coverImage: r.coverImage ?? undefined,
      category: r.category ?? undefined,
      tags: json<string[]>(r.tagsJson, []),
      readTimeMin: r.readTimeMin ?? undefined,
      publishedAt: r.publishedAt,
      body: r.bodyMd,
    };
  }, null),
);

/* ------------------------------------------------------------------ */
/*  Events — DB-only; empty until the admin posts events.              */
/* ------------------------------------------------------------------ */

function mapEvent(r: typeof t.events.$inferSelect, confirmedCount: number): EventItem {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary,
    descriptionMd: r.descriptionMd,
    image: r.image ?? undefined,
    location: r.location,
    mode: r.mode as EventItem["mode"],
    startAt: r.startAt,
    endAt: r.endAt ?? undefined,
    capacity: r.capacity ?? undefined,
    pricePaise: r.pricePaise,
    currency: r.currency,
    status: r.status as EventItem["status"],
    confirmedCount,
  };
}

function confirmedCounts(): Map<number, number> {
  const rows = getDb()
    .select({ eventId: t.eventRegistrations.eventId })
    .from(t.eventRegistrations)
    .where(eq(t.eventRegistrations.status, "confirmed"))
    .all();
  const map = new Map<number, number>();
  for (const r of rows) map.set(r.eventId, (map.get(r.eventId) ?? 0) + 1);
  return map;
}

export const getEvents = cache(async (): Promise<EventItem[]> =>
  safe(() => {
    const rows = getDb()
      .select()
      .from(t.events)
      .where(eq(t.events.status, "published"))
      .orderBy(asc(t.events.startAt))
      .all();
    const counts = confirmedCounts();
    return rows.map((r) => mapEvent(r, counts.get(r.id) ?? 0));
  }, []),
);

export const getEvent = cache(async (slug: string): Promise<EventItem | null> =>
  safe(() => {
    const r = getDb().select().from(t.events).where(eq(t.events.slug, slug)).get();
    if (!r || r.status === "draft") return null;
    const counts = confirmedCounts();
    return mapEvent(r, counts.get(r.id) ?? 0);
  }, null),
);

/** Events split by start time — computed here so components stay pure. */
export const getEventsSplit = cache(
  async (): Promise<{ upcoming: EventItem[]; past: EventItem[] }> => {
    const events = await getEvents();
    const now = Date.now();
    return {
      upcoming: events.filter((e) => new Date(e.startAt).getTime() >= now),
      past: events
        .filter((e) => new Date(e.startAt).getTime() < now)
        .sort((a, b) => (a.startAt < b.startAt ? 1 : -1)),
    };
  },
);

/** Registration-relevant view of one event (seat math + time), kept out of render. */
export const getEventView = cache(async (slug: string) => {
  const event = await getEvent(slug);
  if (!event) return null;
  const seatsLeft = event.capacity == null ? null : Math.max(0, event.capacity - event.confirmedCount);
  const isPast = new Date(event.startAt).getTime() < Date.now();
  const isSoldOut = seatsLeft === 0;
  const isCancelled = event.status === "cancelled";
  return {
    event,
    seatsLeft,
    isPast,
    isSoldOut,
    isCancelled,
    isOpen: !isPast && !isSoldOut && !isCancelled && event.status === "published",
  };
});
