import type { StructureResolver } from "sanity/structure";
import { SINGLETONS } from "./schemaTypes";

const SINGLETON_TITLES: Record<string, string> = {
  trainer: "Trainer Profile",
  consultation: "Consultation Call",
  siteSettings: "Site Settings",
};

/**
 * Desk structure: singletons are shown as a single editable document (no list),
 * collections (programs, transformations, testimonials, faqs, socials) as lists.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      ...SINGLETONS.map((type) =>
        S.listItem()
          .title(SINGLETON_TITLES[type])
          .id(type)
          .child(S.document().schemaType(type).documentId(type)),
      ),
      S.divider(),
      S.documentTypeListItem("program").title("Programs"),
      S.documentTypeListItem("transformation").title("Transformations"),
      S.documentTypeListItem("testimonial").title("Testimonials"),
      S.documentTypeListItem("post").title("Blog Posts"),
      S.documentTypeListItem("faq").title("FAQs"),
      S.documentTypeListItem("socialLink").title("Social Links"),
    ]);
