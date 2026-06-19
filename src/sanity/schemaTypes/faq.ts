import { defineType, defineField } from "sanity";

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  fieldsets: [
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "question",
      title: "Question",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "answer",
      title: "Answer",
      type: "text",
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Group",
      description: "Used to group related questions together.",
      type: "string",
      options: { list: ["Consultation Call", "Services Provided", "Package Details", "General"] },
      initialValue: "General",
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
  preview: { select: { title: "question", subtitle: "category" } },
});
