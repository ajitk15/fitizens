import { defineType, defineField } from "sanity";

const GOALS = [
  { title: "Fat Loss", value: "fat-loss" },
  { title: "Muscle Gain", value: "muscle-gain" },
  { title: "Recomposition", value: "recomp" },
  { title: "Lifestyle / Health", value: "lifestyle" },
];

export const transformation = defineType({
  name: "transformation",
  title: "Transformation (Before / After)",
  type: "document",
  fieldsets: [
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "clientName",
      title: "Client name",
      description: "First name or initials are fine.",
      type: "string",
    }),
    defineField({
      name: "beforeImage",
      title: "Before photo",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "afterImage",
      title: "After photo",
      type: "image",
      options: { hotspot: true },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "summary",
      title: "Result",
      description: 'Short outcome line, e.g. "Lost 12 kg in 16 weeks".',
      type: "string",
    }),
    defineField({
      name: "goal",
      title: "Goal",
      type: "string",
      options: { list: GOALS },
      initialValue: "fat-loss",
    }),
    defineField({
      name: "durationWeeks",
      title: "How long it took (weeks)",
      type: "number",
    }),
    defineField({
      name: "consentGiven",
      title: "Client has approved showing these photos",
      description: "Please only publish once the client has agreed to share their before/after photos.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "featured",
      title: "Show on the homepage",
      type: "boolean",
      initialValue: false,
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
  preview: { select: { title: "clientName", subtitle: "summary", media: "afterImage" } },
});
