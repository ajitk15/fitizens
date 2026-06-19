import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "./env";

/** Source type accepted by the image builder, derived to avoid deep-path imports. */
type SanityImageSource = Parameters<ReturnType<typeof createImageUrlBuilder>["image"]>[0];

const builder =
  projectId ? createImageUrlBuilder({ projectId, dataset }) : null;

/**
 * Build a CDN URL for a Sanity image reference. Components render these through
 * `next/image`; `cdn.sanity.io` is allowlisted in `next.config.ts`.
 * Returns an empty string when the source/project is unavailable so callers can
 * fall back to bundled `/images/*` paths.
 */
export function urlForImage(source: SanityImageSource | undefined | null): string {
  if (!builder || !source) return "";
  return builder.image(source).auto("format").fit("max").url();
}
