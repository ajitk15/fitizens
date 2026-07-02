import Image from "next/image";
import type { EventItem } from "@/content/site";
import { ButtonLink } from "./Button";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

export function eventSeatsLeft(event: EventItem): number | null {
  if (event.capacity == null) return null;
  return Math.max(0, event.capacity - event.confirmedCount);
}

export function EventCard({ event, past = false }: { event: EventItem; past?: boolean }) {
  const seatsLeft = eventSeatsLeft(event);
  const soldOut = seatsLeft === 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-ink-card transition-all duration-300 hover:-translate-y-1 hover:border-accent/60">
      {event.image && (
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 380px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-card via-ink-card/30 to-transparent" />
        </div>
      )}

      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {formatDate(event.startAt)} · {formatTime(event.startAt)}
        </p>
        <h3 className="mt-2 font-display text-2xl uppercase">{event.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{event.summary}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
            {event.mode === "online" ? "Online" : "In person"}
          </span>
          <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
            {event.location}
          </span>
          <span className="rounded-full border border-line px-2.5 py-1 text-xs text-muted">
            {event.pricePaise === 0 ? "Free" : `₹${(event.pricePaise / 100).toLocaleString("en-IN")}`}
          </span>
          {soldOut && (
            <span className="rounded-full border border-red-400/40 px-2.5 py-1 text-xs text-red-400">
              Sold out
            </span>
          )}
          {!soldOut && seatsLeft != null && seatsLeft <= 10 && !past && (
            <span className="rounded-full border border-accent/40 px-2.5 py-1 text-xs text-accent">
              {seatsLeft} seats left
            </span>
          )}
        </div>

        <div className="mt-6 pt-2">
          <ButtonLink
            href={`/events/${event.slug}`}
            className="w-full"
            variant={past || soldOut ? "secondary" : "primary"}
          >
            {past ? "View recap" : soldOut ? "View details" : "View & register"}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
