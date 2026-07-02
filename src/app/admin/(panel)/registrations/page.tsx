import { desc, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function RegistrationsAdminPage() {
  const rows = getDb()
    .select({
      reg: t.eventRegistrations,
      eventTitle: t.events.title,
    })
    .from(t.eventRegistrations)
    .innerJoin(t.events, eq(t.eventRegistrations.eventId, t.events.id))
    .orderBy(desc(t.eventRegistrations.id))
    .all();

  return (
    <>
      <AdminHeading title="Event Registrations" />
      <AdminTable headers={["Attendee", "Event", "Registered", "Status"]}>
        {rows.map(({ reg, eventTitle }) => (
          <tr key={reg.id}>
            <td className="px-4 py-3">
              <span className="font-semibold">{reg.name}</span>
              <span className="block text-xs text-muted">{reg.email}</span>
              <a
                href={`https://wa.me/${reg.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-accent hover:underline"
              >
                {reg.whatsapp}
              </a>
            </td>
            <td className="px-4 py-3 text-muted">{eventTitle}</td>
            <td className="px-4 py-3 text-xs text-muted">
              {new Date(reg.createdAt).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-3">
              <StatusPill value={reg.status} />
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td colSpan={4} className="px-4 py-8 text-center text-muted">
              No registrations yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </>
  );
}
