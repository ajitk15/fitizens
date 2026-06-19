import { createClient } from "next-sanity";
import { draftMode } from "next/headers";
import type { QueryParams } from "@sanity/client";
import { apiVersion, dataset, isSanityConfigured, projectId, readToken } from "./env";

/**
 * Read-only Sanity client (published content). `useCdn: false` so an on-demand
 * `revalidateTag("sanity")` (fired by the publish webhook) always pulls fresh
 * content; Next.js still caches results between revalidations via fetch tags.
 */
export const client = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: readToken,
      perspective: "published",
    })
  : null;

/**
 * Preview client used inside the Studio's Presentation tool: returns draft
 * content and stega-encodes strings so the visual-editing overlays can map each
 * piece of text back to its field for click-to-edit.
 */
const previewClient = isSanityConfigured
  ? createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      token: readToken,
      perspective: "drafts",
      stega: { enabled: true, studioUrl: "/studio" },
    })
  : null;

/** Cache tag applied to every published CMS read; the webhook revalidates this tag. */
export const SANITY_TAG = "sanity";

/**
 * Fetch helper. Returns `null` when Sanity is unconfigured or the query
 * fails/returns empty, so callers can fall back to bundled defaults.
 *
 * - Inside the Presentation tool (draft mode on): live draft content + stega.
 * - Production: cached + tagged for on-demand revalidation via the webhook.
 * - Local dev: uncached, so published edits show on every refresh.
 */
export async function sanityFetch<T>(
  query: string,
  params: QueryParams = {},
): Promise<T | null> {
  if (!isSanityConfigured) return null;

  let isDraft = false;
  try {
    isDraft = (await draftMode()).isEnabled;
  } catch {
    // Outside a request scope (e.g. generateStaticParams at build) — treat as published.
  }

  try {
    if (isDraft && previewClient) {
      const data = await previewClient.fetch<T>(query, params, { cache: "no-store" });
      return data ?? null;
    }
    const data = await client!.fetch<T>(
      query,
      params,
      process.env.NODE_ENV === "production"
        ? { next: { tags: [SANITY_TAG], revalidate: 3600 } }
        : { cache: "no-store" },
    );
    if (data == null) return null;
    if (Array.isArray(data) && data.length === 0) return null;
    return data;
  } catch (err) {
    console.error("[sanity] fetch failed, using fallback content:", err);
    return null;
  }
}
