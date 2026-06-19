import { defineType, defineField } from "sanity";

export const socialLink = defineType({
  name: "socialLink",
  title: "Social Link",
  type: "document",
  fieldsets: [
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      description: 'e.g. "Instagram", "YouTube".',
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "Profile link",
      description: "The full web address to your profile.",
      type: "url",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "handle",
      title: "Username / handle",
      description: 'e.g. "@satya_muddena".',
      type: "string",
    }),
    defineField({
      name: "followers",
      title: "Follower count",
      description: "Optional — shown as social proof.",
      type: "number",
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
  preview: { select: { title: "platform", subtitle: "handle" } },
});
