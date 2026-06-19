/**
 * Sanity environment configuration.
 *
 * The site degrades gracefully: when these env vars are absent the content
 * getters in `src/sanity/queries.ts` fall back to the bundled defaults in
 * `src/content/site.ts`, so the site (and `next build`) keep working before the
 * client has finished wiring up their Sanity project.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/** Pin a date-based API version so query behaviour is stable over time. */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

/** Server-only read token, used for SSR/ISR (kept out of the client bundle). */
export const readToken = process.env.SANITY_API_READ_TOKEN;

/** True only when a project id is configured — gates all live CMS reads. */
export const isSanityConfigured = Boolean(projectId);
