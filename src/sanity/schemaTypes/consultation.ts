import { defineType, defineField } from "sanity";

/** Singleton: the paid discovery-call details. */
export const consultation = defineType({
  name: "consultation",
  title: "Consultation Call",
  type: "document",
  fieldsets: [
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "price",
      title: "Call price (₹)",
      type: "number",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "durationLabel",
      title: "Call length",
      description: 'e.g. "30–45 min".',
      type: "string",
      initialValue: "30–45 min",
    }),
    defineField({
      name: "note",
      title: "Note",
      description: "Shown under the price (e.g. the fee-adjustment policy).",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "INR",
      fieldset: "advanced",
    }),
  ],
  preview: { select: { title: "durationLabel", subtitle: "price" } },
});
