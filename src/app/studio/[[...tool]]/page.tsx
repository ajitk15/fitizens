/**
 * Embedded Sanity Studio — the editing dashboard the client logs into at
 * /studio. Rendered as a full-screen client app; excluded from search indexing.
 */
import type { Metadata, Viewport } from "next";
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Content Studio",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Studio manages its own overflow; prevent double scrollbars.
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function StudioPage() {
  return <NextStudio config={config} />;
}
