"use client";

import Script from "next/script";
import { site } from "@/content/site";

interface CalendlyEmbedProps {
  /** Scheduling URL (from the CMS / env); falls back to the bundled default. */
  url?: string;
}

/**
 * Inline Calendly widget. Loads Calendly's embed script and mounts the widget
 * at the configured URL. When no URL is set yet, shows a graceful placeholder so
 * the page never looks broken before the client's scheduling account is connected.
 */
export function CalendlyEmbed({ url = site.calendlyUrl }: CalendlyEmbedProps = {}) {

  if (!url) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-ink-card p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M3 10h18M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="mt-4 font-display text-xl uppercase">Calendar booking coming soon</h3>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Submit the form and I&apos;ll confirm your slot on WhatsApp. Online
          self-scheduling will be enabled here shortly.
        </p>
        {/* TODO: set NEXT_PUBLIC_CALENDLY_URL to the client's Calendly link to activate. */}
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="lazyOnload"
      />
      <link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet" />
      <div
        className="calendly-inline-widget overflow-hidden rounded-2xl border border-line"
        data-url={url}
        style={{ minWidth: "320px", height: "640px" }}
      />
    </>
  );
}
