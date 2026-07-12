import { desc } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";
import { setLeadStatusAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function LeadsAdminPage() {
  const leads = getDb().select().from(t.leads).orderBy(desc(t.leads.id)).all();
  return (
    <>
      <AdminHeading title="Enquiries" />
      <AdminTable headers={["Contact", "Goal / Level", "Message", "Received", "Status", ""]}>
        {leads.map((l) => (
          <tr key={l.id}>
            <td className="px-4 py-3">
              <span className="font-semibold">{l.name}</span>
              <a
                href={`https://wa.me/${l.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-accent hover:underline"
              >
                {l.whatsapp}
              </a>
              {l.email && <span className="block text-xs text-muted">{l.email}</span>}
            </td>
            <td className="px-4 py-3 text-muted">
              {l.goal ?? "—"}
              <span className="block text-xs">{l.level ?? ""}</span>
            </td>
            <td className="max-w-xs px-4 py-3 text-muted">
              <span className="line-clamp-2">{l.message ?? "—"}</span>
              {l.preferredDatetime && (
                <span className="block text-xs text-accent/80">Prefers: {l.preferredDatetime}</span>
              )}
            </td>
            <td className="px-4 py-3 text-xs text-muted">
              {new Date(l.createdAt).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-3">
              <StatusPill value={l.status} />
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                {l.status !== "contacted" && (
                  <form action={setLeadStatusAction.bind(null, l.id, "contacted")}>
                    <button className="rounded-lg border border-line px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent">
                      Contacted
                    </button>
                  </form>
                )}
                {l.status !== "closed" && (
                  <form action={setLeadStatusAction.bind(null, l.id, "closed")}>
                    <button className="rounded-lg border border-line px-2 py-1 text-xs text-muted hover:border-accent hover:text-accent">
                      Close
                    </button>
                  </form>
                )}
              </div>
            </td>
          </tr>
        ))}
        {leads.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-muted">
              No enquiries yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </>
  );
}
