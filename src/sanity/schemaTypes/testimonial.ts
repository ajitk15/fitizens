import { defineType, defineField } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  fieldsets: [
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "clientName",
      title: "Client name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "quote",
      title: "What they said",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "result",
      title: "Result achieved",
      description: 'Optional, e.g. "Gained 6 kg lean muscle".',
      type: "string",
    }),
    defineField({
      name: "image",
      title: "Client photo",
      description: "Optional.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "rating",
      title: "Star rating",
      description: "1 to 5 stars.",
      type: "number",
      initialValue: 5,
      validation: (r) => r.min(1).max(5),
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
  preview: { select: { title: "clientName", subtitle: "result", media: "image" } },
});
