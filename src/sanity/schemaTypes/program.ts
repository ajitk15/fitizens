import { defineType, defineField } from "sanity";

const GOALS = [
  { title: "Fat Loss", value: "fat-loss" },
  { title: "Muscle Gain", value: "muscle-gain" },
  { title: "Recomposition", value: "recomp" },
  { title: "Lifestyle / Health", value: "lifestyle" },
];

export const program = defineType({
  name: "program",
  title: "Program / Package",
  type: "document",
  fieldsets: [
    { name: "pricing", title: "Pricing (internal — not shown on the site)", options: { collapsible: true, collapsed: true } },
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Package name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "image",
      title: "Package photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "durationLabel",
      title: "Duration",
      description: 'Shown on the card, e.g. "12 Weeks".',
      type: "string",
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      description: "One or two lines shown on the package card.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "fullDescription",
      title: "Full description",
      description: "The longer text shown on the package's own page.",
      type: "text",
      rows: 5,
    }),
    defineField({
      name: "features",
      title: "What's included",
      description: "Add one item per line — these appear as the ticked list.",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "goalTags",
      title: "Best for these goals",
      type: "array",
      of: [{ type: "string" }],
      options: { list: GOALS },
    }),
    defineField({
      name: "popular",
      title: 'Highlight as "Most Popular"',
      type: "boolean",
      initialValue: false,
    }),
    // --- Pricing (internal) ---
    defineField({
      name: "price",
      title: "Price (₹)",
      description: "Stored for your reference only — pricing is not shown publicly.",
      type: "number",
      fieldset: "pricing",
    }),
    defineField({
      name: "billingPeriod",
      title: "Billing period",
      type: "string",
      options: { list: ["monthly", "quarterly", "one-time"] },
      initialValue: "one-time",
      fieldset: "pricing",
    }),
    // --- Advanced ---
    defineField({
      name: "slug",
      title: "Page address (URL)",
      description: 'Auto-filled from the name. Click "Generate" after renaming if you want the web address to match.',
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
      fieldset: "advanced",
    }),
    defineField({
      name: "displayOrder",
      title: "Order on the site",
      description: "Lower numbers show first.",
      type: "number",
      initialValue: 1,
      fieldset: "advanced",
    }),
  ],
  orderings: [
    { title: "Display order", name: "displayOrderAsc", by: [{ field: "displayOrder", direction: "asc" }] },
  ],
  preview: { select: { title: "title", subtitle: "durationLabel", media: "image" } },
});
