import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { deleteEventAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function EventsAdminPage() {
  const db = getDb();
  const events = db.select().from(t.events).orderBy(desc(t.events.startAt)).all();
  const counts = new Map(
    db
      .select({
        eventId: t.eventRegistrations.eventId,
        c: sql<number>`COUNT(*)`,
      })
      .from(t.eventRegistrations)
      .where(eq(t.eventRegistrations.status, "confirmed"))
      .groupBy(t.eventRegistrations.eventId)
      .all()
      .map((r) => [r.eventId, r.c]),
  );

  return (
    <>
      <AdminHeading title="Events" action={{ href: "/admin/events/new", label: "+ New event" }} />
      <AdminTable headers={["Event", "When", "Price", "Seats", "Status", ""]}>
        {events.map((e) => (
          <tr key={e.id}>
            <td className="px-4 py-3">
              <Link href={`/admin/events/${e.id}`} className="font-semibold hover:text-accent">
                {e.title}
              </Link>
              <span className="block text-xs text-muted">
                /events/{e.slug} · {e.mode} · {e.location}
              </span>
            </td>
            <td className="px-4 py-3 text-xs text-muted">
              {new Date(e.startAt).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-3 text-muted">
              {e.pricePaise === 0 ? "Free" : `₹${(e.pricePaise / 100).toLocaleString("en-IN")}`}
            </td>
            <td className="px-4 py-3 text-muted">
              {counts.get(e.id) ?? 0}
              {e.capacity ? ` / ${e.capacity}` : ""}
            </td>
            <td className="px-4 py-3">
              <StatusPill value={e.status} />
            </td>
            <td className="px-4 py-3 text-right">
              <DeleteForm
                action={deleteEventAction.bind(null, e.id)}
                confirmText={`Delete "${e.title}" and its registrations?`}
              />
            </td>
          </tr>
        ))}
        {events.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-muted">
              No events yet — post your first bootcamp or workshop.
            </td>
          </tr>
        )}
      </AdminTable>
    </>
  );
}
