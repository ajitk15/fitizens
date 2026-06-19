import { defineType, defineField } from "sanity";

export const post = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fieldsets: [
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "excerpt",
      title: "Summary",
      description: "A short teaser shown on the blog list and in search results.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "body",
      title: "Article",
      description: "Write your post here — headings, lists, links and images all work.",
      type: "array",
      of: [
        { type: "block" },
        { type: "image", options: { hotspot: true } },
      ],
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["Nutrition", "Training", "Lifestyle", "Mindset", "General"] },
      initialValue: "General",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "publishedAt",
      title: "Publish date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({
      name: "isPublished",
      title: "Show on the site",
      description: "Turn off to keep this as a draft that visitors can't see.",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "readTimeMin",
      title: "Read time (minutes)",
      description: "Optional — leave blank to estimate automatically.",
      type: "number",
      fieldset: "advanced",
    }),
    defineField({
      name: "slug",
      title: "Page address (URL)",
      description: 'Auto-filled from the title. Click "Generate" after renaming to match.',
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
      fieldset: "advanced",
    }),
  ],
  orderings: [
    { title: "Newest first", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
