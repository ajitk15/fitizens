/**
 * Enables Next.js draft mode for the Studio's Presentation tool. Sanity calls
 * this with a signed preview-URL secret; `defineEnableDraftMode` validates it
 * (using the read token) before turning on draft mode, then redirects into the
 * previewed page.
 */
import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "@/sanity/env";

const client = createClient({
  projectId: projectId || "missing-project-id",
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken,
});

export const { GET } = defineEnableDraftMode({ client });
