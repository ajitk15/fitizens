import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { EventCard } from "@/components/EventCard";
import { ButtonLink } from "@/components/Button";
import { getEventsSplit, getSite } from "@/lib/content";
import { assertPageVisible } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Events & Bootcamps",
  description:
    "Live fitness events, bootcamps and workshops by FITIZENS — train together, learn the fundamentals and kick-start your transformation.",
  alternates: { canonical: "/events" },
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  await assertPageVisible("events");
  const [{ upcoming, past }, site] = await Promise.all([getEventsSplit(), getSite()]);

  return (
    <>
      <section className="relative overflow-hidden pt-28">
        <div className="accent-radial pointer-events-none absolute inset-0" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <SectionHeading
            align="center"
            eyebrow="Events & Bootcamps"
            title={<>Train <span className="text-accent">together</span></>}
            subtitle="Live workshops, bootcamps and challenges — online and in Hyderabad. Limited seats, first come first served."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {upcoming.length === 0 ? (
          <Reveal>
            <div className="rounded-2xl border border-line bg-ink-card p-10 text-center">
              <h2 className="font-display text-2xl uppercase">No upcoming events yet</h2>
              <p className="mx-auto mt-3 max-w-md text-muted">
                New bootcamps and workshops are announced here first. Meanwhile, book a
                consultation and start your plan today.
              </p>
              <ButtonLink href="/contact" size="lg" className="mt-6">
                {site.ctaLabel}
              </ButtonLink>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((event, i) => (
              <Reveal key={event.id} delay={i * 0.05}>
                <EventCard event={event} />
              </Reveal>
            ))}
          </div>
        )}

        {past.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 font-display text-2xl uppercase text-muted">Past events</h2>
            <div className="grid gap-6 opacity-75 md:grid-cols-2 lg:grid-cols-3">
              {past.slice(0, 6).map((event) => (
                <EventCard key={event.id} event={event} past />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
