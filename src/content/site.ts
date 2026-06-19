/**
 * FITIZENS — single source of truth for all site content.
 *
 * Everything the marketing site renders comes from this file so the trainer (or
 * a future CMS) can edit copy in one place. Types mirror the data model in
 * docs/requirement.md §5. Replace placeholder content (marked PLACEHOLDER) once
 * the client supplies final bio text, testimonials and before/after pairs.
 */

import type { PortableTextBlock } from "@portabletext/types";

export type Goal = "fat-loss" | "muscle-gain" | "recomp" | "lifestyle";

export interface Trainer {
  fullName: string;
  brand: string;
  tagline: string;
  shortBio: string;
  bio: string[]; // paragraphs
  philosophy: string;
  yearsExperience: number;
  location: string;
  email: string;
  /** Digits only, no +, used for wa.me and tel: links */
  whatsapp: string;
  certifications: string[];
  profileImage: string;
  galleryImages: string[];
}

export interface Stat {
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
}

export interface Program {
  slug: string;
  title: string;
  durationLabel: string;
  shortDescription: string;
  fullDescription: string;
  features: string[];
  goalTags: Goal[];
  /** Real price in INR — hidden from the public UI per client request, kept for later. */
  price: number;
  currency: string;
  billingPeriod: "monthly" | "quarterly" | "one-time";
  popular: boolean;
  displayOrder: number;
  image: string;
}

export interface Transformation {
  id: string;
  clientName: string;
  beforeImage: string;
  afterImage: string;
  goal: Goal;
  durationWeeks: number;
  summary: string;
  consentGiven: boolean;
  featured: boolean;
  /** Placeholder pairs until the client supplies consented real photos. */
  placeholder?: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  image?: string;
  quote: string;
  rating: number; // 1..5
  result?: string;
  featured: boolean;
  placeholder?: boolean;
}

export interface Faq {
  question: string;
  answer: string;
  category: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  handle: string;
  followers?: number;
}

/** Blog — card/listing shape. */
export interface PostListItem {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  category?: string;
  tags?: string[];
  readTimeMin?: number;
  publishedAt: string;
}

/** Blog — full article (adds the Portable Text body). */
export interface Post extends PostListItem {
  body: PortableTextBlock[];
}

/* ------------------------------------------------------------------ */
/*  Trainer profile                                                    */
/* ------------------------------------------------------------------ */
export const trainer: Trainer = {
  fullName: "Satya Muddena",
  brand: "FITIZENS",
  tagline: "Online Fitness Trainer",
  shortBio:
    "INFS-certified nutrition & fitness consultant helping you lose fat, build muscle and fix lifestyle disorders — coached fully online, built around your blood work.",
  bio: [
    // PLACEHOLDER bio — replace with the client's final story & philosophy.
    "I'm Satya Muddena, an online fitness trainer based in Hyderabad with 10+ years in the field. I help everyday people get genuinely fit — without the guesswork, fad diets or complicated routines.",
    "My coaching is simple and science-led: a customized nutrition plan, a supplement protocol and a training program built specifically for you and your latest blood work. Every plan is yours alone — never copy-pasted.",
    "I've worked with people chasing fat loss, muscle building and photoshoot-ready physiques, as well as those managing lifestyle disorders like diabetes, high blood pressure and PCOS. Whatever your starting point, the goal is the same: real, lasting results you can maintain.",
  ],
  philosophy:
    "Friendly, easy and never complicated. Sustainable habits over crash diets, real coaching over generic templates.",
  yearsExperience: 10,
  location: "Hyderabad, Telangana",
  email: "satya.muddena@gmail.com",
  whatsapp: "919949191359",
  certifications: ["INFS Certified Nutritionist & Fitness Consultant"],
  profileImage: "/images/image1.jpeg",
  galleryImages: [
    "/images/image1.jpeg",
    "/images/image2.jpeg",
    "/images/image3.jpeg",
    "/images/image4.jpeg",
  ],
};

/* ------------------------------------------------------------------ */
/*  Stats / trust bar                                                  */
/* ------------------------------------------------------------------ */
export const stats: Stat[] = [
  { label: "Years of Experience", value: 10, suffix: "+" },
  { label: "Clients Coached", value: 500, suffix: "+" },
  { label: "Transformations", value: 100, suffix: "+" },
  { label: "Followers", value: 75, suffix: "K" },
];

/* ------------------------------------------------------------------ */
/*  Programs / coaching packages                                       */
/*  Prices are hidden in the UI (client request) but stored here.      */
/* ------------------------------------------------------------------ */
const SHARED_FEATURES: string[] = [
  "Customized nutrition plan built around your latest blood work",
  "Personalised supplement protocol",
  "Training program tailored to your goals",
  "Daily workout video reviews until your form is perfect",
  "Daily progress tracking — weight, steps, sleep & water intake",
  "WhatsApp support during IST working hours",
  "One scheduled follow-up call every week",
];

const ONLINE_NOTE =
  "This is an online coaching service and does not include 1-on-1 video coaching sessions or in-person personal training.";

export const programs: Program[] = [
  {
    slug: "12-weeks",
    title: "12 Weeks Package",
    durationLabel: "12 Weeks",
    shortDescription:
      "A focused 12-week online coaching block to kick-start your transformation.",
    fullDescription:
      "A complete 12-week online coaching block — the ideal starting point to build momentum, learn the fundamentals and see your first real changes. " +
      ONLINE_NOTE,
    features: SHARED_FEATURES,
    goalTags: ["fat-loss", "muscle-gain", "lifestyle"],
    price: 45000,
    currency: "INR",
    billingPeriod: "one-time",
    popular: false,
    displayOrder: 1,
    image: "/images/image3.jpeg",
  },
  {
    slug: "24-weeks",
    title: "24 Weeks Package",
    durationLabel: "24 Weeks",
    shortDescription:
      "Our most popular plan — six months of coaching for a complete, lasting transformation.",
    fullDescription:
      "Six full months of online coaching — the sweet spot for a complete body recomposition and habits that actually stick. Most clients see their best results here. " +
      ONLINE_NOTE,
    features: SHARED_FEATURES,
    goalTags: ["fat-loss", "muscle-gain", "recomp", "lifestyle"],
    price: 80000,
    currency: "INR",
    billingPeriod: "one-time",
    popular: true,
    displayOrder: 2,
    image: "/images/image2.jpeg",
  },
  {
    slug: "52-weeks",
    title: "52 Weeks Package",
    durationLabel: "52 Weeks",
    shortDescription:
      "A full year of dedicated coaching for the most ambitious, life-changing goals.",
    fullDescription:
      "A full year of dedicated online coaching for the most ambitious goals — total transformation, photoshoot-ready conditioning, or long-term management of a lifestyle disorder. " +
      ONLINE_NOTE,
    features: SHARED_FEATURES,
    goalTags: ["fat-loss", "muscle-gain", "recomp", "lifestyle"],
    price: 120000,
    currency: "INR",
    billingPeriod: "one-time",
    popular: false,
    displayOrder: 3,
    image: "/images/image4.jpeg",
  },
];

/* ------------------------------------------------------------------ */
/*  Consultation (paid discovery call)                                 */
/* ------------------------------------------------------------------ */
export const consultation = {
  price: 3000,
  currency: "INR",
  durationLabel: "30–45 min",
  note: "The ₹3,000 consultation fee is fully adjusted against your package fee once you enrol — you simply pay the remaining balance.",
};

/* ------------------------------------------------------------------ */
/*  Transformations — PLACEHOLDER pairs (await consented real photos)  */
/* ------------------------------------------------------------------ */
export const transformations: Transformation[] = [
  {
    id: "t1",
    clientName: "Client A",
    beforeImage: "/images/image3.jpeg",
    afterImage: "/images/image2.jpeg",
    goal: "fat-loss",
    durationWeeks: 16,
    summary: "Sample before/after — replace with a real, consented transformation.",
    consentGiven: false,
    featured: true,
    placeholder: true,
  },
  {
    id: "t2",
    clientName: "Client B",
    beforeImage: "/images/image4.jpeg",
    afterImage: "/images/image1.jpeg",
    goal: "muscle-gain",
    durationWeeks: 24,
    summary: "Sample before/after — replace with a real, consented transformation.",
    consentGiven: false,
    featured: true,
    placeholder: true,
  },
  {
    id: "t3",
    clientName: "Client C",
    beforeImage: "/images/image1.jpeg",
    afterImage: "/images/image4.jpeg",
    goal: "recomp",
    durationWeeks: 20,
    summary: "Sample before/after — replace with a real, consented transformation.",
    consentGiven: false,
    featured: false,
    placeholder: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Testimonials — PLACEHOLDER (await real client quotes + consent)    */
/* ------------------------------------------------------------------ */
export const testimonials: Testimonial[] = [
  {
    id: "q1",
    clientName: "Placeholder Client",
    quote:
      "Coaching was simple to follow and the daily check-ins kept me accountable. Placeholder testimonial — replace with a real client quote.",
    rating: 5,
    result: "Lost 12 kg in 16 weeks",
    featured: true,
    placeholder: true,
  },
  {
    id: "q2",
    clientName: "Placeholder Client",
    quote:
      "The plan was built around my blood work and actually fit my lifestyle. Placeholder testimonial — replace with a real client quote.",
    rating: 5,
    result: "Reversed pre-diabetic markers",
    featured: true,
    placeholder: true,
  },
  {
    id: "q3",
    clientName: "Placeholder Client",
    quote:
      "Got photoshoot-ready in time and learned how to maintain it. Placeholder testimonial — replace with a real client quote.",
    rating: 5,
    result: "Gained 6 kg lean muscle",
    featured: true,
    placeholder: true,
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ                                                                */
/* ------------------------------------------------------------------ */
export const faqs: Faq[] = [
  {
    question: "How does the consultation call work?",
    answer:
      "Book a 30–45 minute consultation call for ₹3,000. We'll discuss your goals, current lifestyle and the best plan for you. If you enrol, the ₹3,000 is fully adjusted against your package — you only pay the remaining balance.",
    category: "Consultation Call",
  },
  {
    question: "What's included in the coaching?",
    answer:
      "Every package includes a customized nutrition plan based on your latest blood work, a supplement protocol, a tailored training program, daily workout video reviews, daily progress tracking (weight, steps, sleep and water), WhatsApp support during IST working hours, and one scheduled follow-up call every week.",
    category: "Services Provided",
  },
  {
    question: "Is this online or in-person coaching?",
    answer:
      "Coaching is fully online. It does not include 1-on-1 video coaching sessions or in-person personal training — everything is delivered through your custom plans, daily tracking, WhatsApp support and your weekly follow-up call.",
    category: "Services Provided",
  },
  {
    question: "What packages do you offer?",
    answer:
      "Three online coaching packages: 12 Weeks, 24 Weeks (our most popular) and 52 Weeks. Each carries the same comprehensive support — the longer plans simply give you more time for a complete, lasting transformation. Book a consultation to find the right fit and pricing.",
    category: "Package Details",
  },
  {
    question: "Who do you work with?",
    answer:
      "People chasing fat loss, muscle building and photoshoot-ready physiques, as well as those managing lifestyle disorders like diabetes, high blood pressure and PCOS. Beginners are very welcome.",
    category: "Package Details",
  },
  {
    question: "Do you need my blood work?",
    answer:
      "Yes — your nutrition plan and supplement protocol are built around your latest blood work so everything is tailored and safe for you. We'll guide you on exactly what's needed during your consultation.",
    category: "Services Provided",
  },
];

/* ------------------------------------------------------------------ */
/*  Social links                                                       */
/* ------------------------------------------------------------------ */
export const socials: SocialLink[] = [
  {
    platform: "Instagram",
    url: "https://www.instagram.com/satya_muddena",
    handle: "@satya_muddena",
    followers: 75000,
  },
];

/* ------------------------------------------------------------------ */
/*  Site-wide constants                                                */
/* ------------------------------------------------------------------ */
export const site = {
  name: trainer.brand,
  title: `${trainer.brand} — ${trainer.tagline} | ${trainer.fullName}`,
  description: trainer.shortBio,
  /** Update to the live domain before launch. */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://fitizens.in",
  ogImage: trainer.profileImage,
  keywords: [
    "online fitness trainer",
    "personal trainer Hyderabad",
    "fat loss coach",
    "muscle building",
    "online nutrition coach",
    "PCOS fitness",
    "diabetes lifestyle coaching",
    "FITIZENS",
    "Satya Muddena",
  ],
  whatsappLink: `https://wa.me/${trainer.whatsapp}`,
  /** Calendly inline-widget URL — replace with the client's real scheduling link. */
  calendlyUrl: process.env.NEXT_PUBLIC_CALENDLY_URL || "",
};

export const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Programs", href: "/programs" },
  { label: "Transformations", href: "/transformations" },
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

/** Helpers */
export const goalLabels: Record<Goal, string> = {
  "fat-loss": "Fat Loss",
  "muscle-gain": "Muscle Gain",
  recomp: "Recomposition",
  lifestyle: "Lifestyle / Health",
};
