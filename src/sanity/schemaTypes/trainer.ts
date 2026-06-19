import { defineType, defineField } from "sanity";

/** Singleton: the trainer profile + trust-bar stats shown across the site. */
export const trainer = defineType({
  name: "trainer",
  title: "Trainer Profile",
  type: "document",
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "photos", title: "Photos" },
    { name: "stats", title: "Stats" },
    { name: "contact", title: "Contact" },
  ],
  fields: [
    // --- Profile ---
    defineField({ name: "fullName", title: "Your name", type: "string", group: "profile", validation: (r) => r.required() }),
    defineField({ name: "brand", title: "Brand name", type: "string", group: "profile", validation: (r) => r.required() }),
    defineField({
      name: "tagline",
      title: "Tagline",
      description: 'Your short positioning line, e.g. "Online Fitness Trainer".',
      type: "string",
      group: "profile",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "shortBio",
      title: "Short intro",
      description: "One or two sentences shown in the hero and used for search results.",
      type: "text",
      rows: 3,
      group: "profile",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "bio",
      title: "Your story",
      description: "Add one paragraph per item — these appear on the About page.",
      type: "array",
      of: [{ type: "text", rows: 4 }],
      group: "profile",
    }),
    defineField({
      name: "philosophy",
      title: "Coaching philosophy",
      type: "text",
      rows: 3,
      group: "profile",
    }),
    defineField({
      name: "yearsExperience",
      title: "Years of experience",
      type: "number",
      group: "profile",
    }),
    // --- Photos ---
    defineField({
      name: "profileImage",
      title: "Main photo",
      description: "Your hero/profile photo, shown at the top of the site.",
      type: "image",
      options: { hotspot: true },
      group: "photos",
    }),
    defineField({
      name: "galleryImages",
      title: "Gallery photos",
      description: "A few photos shown around the About and home pages.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      group: "photos",
    }),
    // --- Stats ---
    defineField({
      name: "stats",
      title: "Headline numbers",
      description: "The animated counters (years, clients, transformations, followers).",
      type: "array",
      group: "stats",
      of: [
        {
          type: "object",
          fields: [
            { name: "label", title: "Label", type: "string" },
            { name: "value", title: "Number", type: "number" },
            { name: "suffix", title: "After the number (e.g. + or K)", type: "string" },
            { name: "prefix", title: "Before the number", type: "string" },
          ],
          preview: { select: { title: "label", subtitle: "value" } },
        },
      ],
    }),
    // --- Contact ---
    defineField({ name: "email", title: "Email", type: "string", group: "contact" }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp number",
      description: "Digits only, including country code — no +, spaces or dashes (e.g. 919949191359).",
      type: "string",
      group: "contact",
    }),
    defineField({ name: "location", title: "Location", type: "string", group: "contact" }),
    defineField({
      name: "certifications",
      title: "Certifications",
      description: "Add one per line.",
      type: "array",
      of: [{ type: "string" }],
      group: "contact",
    }),
  ],
  preview: { select: { title: "fullName", subtitle: "brand", media: "profileImage" } },
});
