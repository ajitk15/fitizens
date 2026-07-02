import Link from "next/link";
import { notFound } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminCard, AdminHeading, StatusPill } from "@/components/admin/ui";
import { EventForm } from "../EventForm";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const db = getDb();
  const event = db.select().from(t.events).where(eq(t.events.id, Number(id))).get();
  if (!event) notFound();

  const registrations = db
    .select()
    .from(t.eventRegistrations)
    .where(eq(t.eventRegistrations.eventId, event.id))
    .orderBy(desc(t.eventRegistrations.id))
    .all();

  return (
    <>
      <AdminHeading title={`Edit: ${event.title}`} />
      {saved && (
        <p className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-4 py-2 text-sm text-ok">
          Saved.{" "}
          {event.status === "published" && (
            <Link href={`/events/${event.slug}`} target="_blank" className="underline">
              View on site →
            </Link>
          )}
        </p>
      )}
      <EventForm event={event} />

      <div className="mt-10 max-w-3xl">
        <AdminCard title={`Registrations (${registrations.length})`}>
          {registrations.length === 0 ? (
            <p className="text-sm text-muted">No registrations yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {registrations.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span>
                    <span className="font-semibold">{r.name}</span>
                    <span className="block text-xs text-muted">
                      {r.email} · {r.whatsapp}
                    </span>
                  </span>
                  <StatusPill value={r.status} />
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>
    </>
  );
}
