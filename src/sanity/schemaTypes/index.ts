import type { SchemaTypeDefinition } from "sanity";
import { trainer } from "./trainer";
import { program } from "./program";
import { transformation } from "./transformation";
import { testimonial } from "./testimonial";
import { faq } from "./faq";
import { socialLink } from "./socialLink";
import { consultation } from "./consultation";
import { siteSettings } from "./siteSettings";
import { post } from "./post";

export const schemaTypes: SchemaTypeDefinition[] = [
  trainer,
  program,
  transformation,
  testimonial,
  faq,
  socialLink,
  consultation,
  siteSettings,
  post,
];

/** Document types that should exist exactly once (rendered as singletons). */
export const SINGLETONS = ["trainer", "consultation", "siteSettings"] as const;
