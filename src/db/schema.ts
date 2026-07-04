import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

/* ------------------------------------------------------------------ */
/*  Content tables — shapes mirror the types in src/content/site.ts.  */
/*  Array fields are stored as JSON text columns (parsed in lib).     */
/* ------------------------------------------------------------------ */

/** Singleton (id = 1). */
export const trainer = sqliteTable("trainer", {
  id: integer("id").primaryKey(),
  fullName: text("full_name").notNull(),
  brand: text("brand").notNull(),
  tagline: text("tagline").notNull(),
  shortBio: text("short_bio").notNull(),
  bioJson: text("bio_json").notNull(), // string[] paragraphs
  philosophy: text("philosophy").notNull(),
  yearsExperience: integer("years_experience").notNull(),
  location: text("location").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  certificationsJson: text("certifications_json").notNull(), // string[]
  /** Optional scan/photo of the certificate, shown on the About page. */
  certificateImage: text("certificate_image"),
  profileImage: text("profile_image").notNull(),
  galleryImagesJson: text("gallery_images_json").notNull(), // string[]
});

export const stats = sqliteTable("stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  value: integer("value").notNull(),
  suffix: text("suffix"),
  prefix: text("prefix"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const programs = sqliteTable("programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  durationLabel: text("duration_label").notNull(),
  shortDescription: text("short_description").notNull(),
  fullDescription: text("full_description").notNull(),
  featuresJson: text("features_json").notNull(), // string[]
  goalTagsJson: text("goal_tags_json").notNull(), // Goal[]
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("INR"),
  billingPeriod: text("billing_period").notNull().default("one-time"),
  popular: integer("popular", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  image: text("image").notNull(),
});

export const transformations = sqliteTable("transformations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  beforeImage: text("before_image").notNull(),
  afterImage: text("after_image").notNull(),
  goal: text("goal").notNull(),
  durationWeeks: integer("duration_weeks").notNull(),
  summary: text("summary").notNull(),
  consentGiven: integer("consent_given", { mode: "boolean" }).notNull().default(false),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  placeholder: integer("placeholder", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
});

export const testimonials = sqliteTable("testimonials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("client_name").notNull(),
  image: text("image"),
  quote: text("quote").notNull(),
  rating: integer("rating").notNull().default(5),
  result: text("result"),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  placeholder: integer("placeholder", { mode: "boolean" }).notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
});

export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
});

export const socials = sqliteTable("socials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  handle: text("handle").notNull(),
  followers: integer("followers"),
  displayOrder: integer("display_order").notNull().default(0),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  coverImage: text("cover_image"),
  category: text("category"),
  tagsJson: text("tags_json").notNull().default("[]"), // string[]
  readTimeMin: integer("read_time_min"),
  publishedAt: text("published_at").notNull(),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  bodyMd: text("body_md").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/** Singleton (id = 1). */
export const consultation = sqliteTable("consultation", {
  id: integer("id").primaryKey(),
  price: integer("price").notNull(),
  currency: text("currency").notNull().default("INR"),
  durationLabel: text("duration_label").notNull(),
  note: text("note").notNull(),
});

/** Singleton (id = 1). */
export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  siteUrl: text("site_url"),
  keywordsJson: text("keywords_json").notNull().default("[]"), // string[]
  /** Label used by every call-booking button across the site. */
  ctaLabel: text("cta_label").notNull().default("Book a Consultation"),
  /** First-visit popup on the home page. */
  popupEnabled: integer("popup_enabled", { mode: "boolean" }).notNull().default(true),
  popupTitle: text("popup_title").notNull().default("Your transformation starts with a call"),
  popupBody: text("popup_body")
    .notNull()
    .default(
      "One-on-one with Coach Satya — we go through your goals, lifestyle and blood work, then map the exact plan that gets you there.",
    ),
  popupNote: text("popup_note")
    .notNull()
    .default("Strictly one-on-one. Your goals, your plan — undivided attention."),
  /** @deprecated free-text slots — superseded by the structured fields below. */
  popupSlots: text("popup_slots").notNull().default(""),
  /** Structured availability — composed into "Mon–Sat, 4:00 PM – 8:00 PM (IST)". */
  popupDayFrom: text("popup_day_from").notNull().default("Mon"),
  popupDayTo: text("popup_day_to").notNull().default("Sat"),
  popupTimeFrom: text("popup_time_from").notNull().default("16:00"), // 24h HH:MM
  popupTimeTo: text("popup_time_to").notNull().default("20:00"),
  /** Page keys hidden from nav/sitemap (their URLs 404). See HIDEABLE_PAGES. */
  hiddenPagesJson: text("hidden_pages_json").notNull().default("[]"),
});

/* ------------------------------------------------------------------ */
/*  Events & registrations                                             */
/* ------------------------------------------------------------------ */

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  descriptionMd: text("description_md").notNull().default(""),
  image: text("image"),
  location: text("location").notNull().default("Online"),
  mode: text("mode").notNull().default("online"), // 'online' | 'in-person'
  startAt: text("start_at").notNull(), // ISO datetime
  endAt: text("end_at"),
  capacity: integer("capacity"), // null = unlimited
  pricePaise: integer("price_paise").notNull().default(0), // 0 = free
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("draft"), // draft|published|cancelled|completed
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const eventRegistrations = sqliteTable("event_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  whatsapp: text("whatsapp").notNull(),
  status: text("status").notNull().default("pending_payment"), // pending_payment|confirmed|cancelled
  orderId: integer("order_id"),
  createdAt: text("created_at").notNull(),
});

/* ------------------------------------------------------------------ */
/*  Payments                                                           */
/* ------------------------------------------------------------------ */

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull(), // 'consultation' | 'event'
  registrationId: integer("registration_id"),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  razorpayPaymentId: text("razorpay_payment_id"),
  amountPaise: integer("amount_paise").notNull(),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("created"), // created|paid|failed
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  error: text("error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

/* ------------------------------------------------------------------ */
/*  Leads                                                              */
/* ------------------------------------------------------------------ */

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  whatsapp: text("whatsapp").notNull(),
  email: text("email"),
  goal: text("goal"),
  level: text("level"),
  preferredDatetime: text("preferred_datetime"),
  message: text("message"),
  status: text("status").notNull().default("new"), // new|contacted|closed
  createdAt: text("created_at").notNull(),
});

/* ------------------------------------------------------------------ */
/*  Auth                                                               */
/* ------------------------------------------------------------------ */

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    tokenHash: text("token_hash").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    createdAt: text("created_at").notNull(),
    expiresAt: text("expires_at").notNull(),
    ip: text("ip"),
    userAgent: text("user_agent"),
  },
  (t) => [primaryKey({ columns: [t.tokenHash] })],
);

/* ------------------------------------------------------------------ */
/*  Audit log — append-only; no update/delete code paths exist.        */
/* ------------------------------------------------------------------ */

export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  at: text("at").notNull(),
  actor: text("actor").notNull(), // admin email | 'public' | 'system'
  action: text("action").notNull(), // create|update|delete|login|login_failed|logout|payment_*|register|lead
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  beforeJson: text("before_json"),
  afterJson: text("after_json"),
  ip: text("ip"),
  userAgent: text("user_agent"),
});
