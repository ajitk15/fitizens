import { defineType, defineField } from "sanity";

/** Singleton: site-wide SEO + integration settings. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fieldsets: [
    { name: "advanced", title: "Advanced settings", options: { collapsible: true, collapsed: true } },
  ],
  fields: [
    defineField({
      name: "calendlyUrl",
      title: "Calendly booking link",
      description: "Paste your Calendly link to turn on online booking on the Contact page.",
      type: "url",
    }),
    defineField({
      name: "keywords",
      title: "Search keywords",
      description: "Words people might search for to find you (helps SEO).",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "siteUrl",
      title: "Website address",
      description: "Your live domain — only change this if your domain changes.",
      type: "url",
      fieldset: "advanced",
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
