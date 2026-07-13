"use client";

import Script from "next/script";

/**
 * Inline Calendly scheduler. Calendly's widget.js auto-initialises any element
 * with the `calendly-inline-widget` class using its `data-url`. Renders nothing
 * without a url so the contact page degrades to the form-only flow.
 */
export function CalendlyEmbed({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <>
      <div
        className="calendly-inline-widget overflow-hidden rounded-2xl border border-line bg-white"
        data-url={url}
        style={{ minWidth: "320px", height: "700px" }}
      />
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />
    </>
  );
}
