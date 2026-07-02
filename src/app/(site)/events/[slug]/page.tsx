import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/Reveal";
import { MarkdownBody } from "@/components/MarkdownBody";
import { EventRegistrationForm } from "@/components/EventRegistrationForm";
import { getEvent, getEventView, getSite } from "@/lib/content";

export const dynamic = "force-dynamic";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.summary,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: event.image
      ? { title: event.title, description: event.summary, images: [{ url: event.image }] }
      : { title: event.title, description: event.summary },
  };
}

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default async function EventDetailPage({ params }: Params) {
  const { slug } = await params;
  const [view, site] = await Promise.all([getEventView(slug), getSite()]);
  if (!view) notFound();
  const { event, seatsLeft, isPast: past, isSoldOut: soldOut, isCancelled: cancelled, isOpen: open } = view;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    startDate: event.startAt,
    endDate: event.endAt,
    eventStatus: cancelled
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.mode === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
    location:
      event.mode === "online"
        ? { "@type": "VirtualLocation", url: `${site.url}/events/${event.slug}` }
        : { "@type": "Place", name: event.location, address: event.location },
    image: event.image ? [event.image] : undefined,
    offers: {
      "@type": "Offer",
      price: event.pricePaise / 100,
      priceCurrency: event.currency,
      availability: soldOut ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: `${site.url}/events/${event.slug}`,
    },
    organizer: { "@type": "Person", name: site.name, url: site.url },
  };

  return (
    <article className="pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Link href="/events" className="text-sm text-muted transition-colors hover:text-accent">
          ← All events
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {formatDateTime(event.startAt)}
            </p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-tight sm:text-5xl">
              {event.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted">{event.summary}</p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-line px-3 py-1 text-muted">
                {event.mode === "online" ? "Online" : "In person"} · {event.location}
              </span>
              <span className="rounded-full border border-line px-3 py-1 text-muted">
                {event.pricePaise === 0
                  ? "Free"
                  : `₹${(event.pricePaise / 100).toLocaleString("en-IN")}`}
              </span>
              {seatsLeft != null && !past && (
                <span
                  className={`rounded-full border px-3 py-1 ${soldOut ? "border-red-400/40 text-red-400" : "border-accent/40 text-accent"}`}
                >
                  {soldOut ? "Sold out" : `${seatsLeft} seats left`}
                </span>
              )}
              {cancelled && (
                <span className="rounded-full border border-red-400/40 px-3 py-1 text-red-400">
                  Cancelled
                </span>
              )}
            </div>

            {event.image && (
              <Reveal className="mt-8">
                <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-line">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width:1024px) 92vw, 700px"
                    className="object-cover"
                    priority
                  />
                </div>
              </Reveal>
            )}

            {event.descriptionMd && (
              <div className="mt-8">
                <MarkdownBody source={event.descriptionMd} />
              </div>
            )}
          </div>

          <aside className="lg:pt-10">
            <div className="lg:sticky lg:top-24">
              {open ? (
                <EventRegistrationForm event={event} />
              ) : (
                <div className="rounded-2xl border border-line bg-ink-card p-6 sm:p-8">
                  <h3 className="font-display text-2xl uppercase">
                    {cancelled ? "Event cancelled" : past ? "This event is over" : "Sold out"}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {cancelled
                      ? "This event was cancelled. Registered attendees will be contacted."
                      : past
                        ? "Missed it? New events are announced here first — or start your own plan with a consultation."
                        : "All seats are taken. Message me on WhatsApp to join the waitlist."}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-5 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-deep"
                  >
                    {site.ctaLabel}
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
      <div className="pb-16" />
    </article>
  );
}
