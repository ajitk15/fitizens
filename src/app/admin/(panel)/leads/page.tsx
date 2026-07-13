import { desc } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";
import { setLeadStatusAction } from "./actions";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<string, string> = {
  details: "Details",
  paid: "Paid",
  booked: "Booked",
};

export default async function LeadsAdminPage() {
  const leads = getDb().select().from(t.leads).orderBy(desc(t.leads.id)).all();

  // Funnel counts for the analytics cards.
  const count = (stage: string) => leads.filter((l) => l.stage === stage).length;
  const paid = count("paid");
  const booked = count("booked");
  const started = leads.length;
  const conversion = started ? Math.round((booked / started) * 100) : 0;
  const funnel = [
    { label: "Details captured", value: started },
    { label: "Paid", value: paid + booked },
    { label: "Booked", value: booked },
    { label: "Booked / started", value: `${conversion}%` },
  ];

  return (
    <>
      <AdminHeading title="Bookings" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {funnel.map((f) => (
          <div key={f.label} className="rounded-2xl border border-line bg-ink-card p-5">
            <p className="font-display text-4xl text-accent">{f.value}</p>
            <p className="mt-1 text-sm text-muted">{f.label}</p>
          </div>
        ))}
      </div>

      <AdminTable headers={["Contact", "Goal / Level", "Message", "Stage", "Received", "Status", ""]}>
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
            </td>
            <td className="px-4 py-3">
              <StatusPill value={STAGE_LABEL[l.stage] ?? l.stage} />
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
            <td colSpan={7} className="px-4 py-8 text-center text-muted">
              No bookings yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </>
  );
}
