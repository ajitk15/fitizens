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

function minutesSince(value: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
}

function ageLabel(value: string) {
  const mins = minutesSince(value);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function whatsappHref(phone: string, text: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
}

export default async function LeadsAdminPage() {
  const leads = getDb().select().from(t.leads).orderBy(desc(t.leads.id)).all();

  // Funnel counts for the analytics cards.
  const count = (stage: string) => leads.filter((l) => l.stage === stage).length;
  const paid = count("paid");
  const booked = count("booked");
  const started = leads.length;
  const staleDetails = leads.filter((l) => l.stage === "details" && minutesSince(l.createdAt) >= 30).length;
  const paidPending = leads.filter((l) => l.stage === "paid").length;
  const conversion = started ? Math.round((booked / started) * 100) : 0;
  const funnel = [
    { label: "Details captured", value: started },
    { label: "Paid", value: paid + booked },
    { label: "Booked", value: booked },
    { label: "Needs follow-up", value: staleDetails + paidPending },
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
      <p className="mb-4 text-sm text-muted">
        Booked / started: {conversion}%. Follow up on details-only leads older than 30 minutes
        and paid leads that have not picked a slot.
      </p>

      <AdminTable headers={["Contact", "Goal / Level", "Message", "Stage", "Payment / booking", "Received", "Status", ""]}>
        {leads.map((l) => {
          const needsDetailsFollowup = l.stage === "details" && minutesSince(l.createdAt) >= 30;
          const needsSlotFollowup = l.stage === "paid";
          const followupText = needsSlotFollowup
            ? `Hi ${l.name}, your FITIZENS consultation payment is received. Please pick your slot, or reply here and I'll help you schedule it. Booking ID: #${l.id}`
            : `Hi ${l.name}, I noticed you started booking a FITIZENS consultation. Do you need help completing payment or choosing a slot? Booking ID: #${l.id}`;

          return (
          <tr key={l.id} className={needsDetailsFollowup || needsSlotFollowup ? "bg-accent/5" : undefined}>
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
              <span className="mt-1 block text-xs text-muted/70">Booking #{l.id}</span>
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
              {needsDetailsFollowup && (
                <span className="mt-1 block text-xs text-warn">Abandoned after details</span>
              )}
              {needsSlotFollowup && (
                <span className="mt-1 block text-xs text-warn">Paid, slot pending</span>
              )}
            </td>
            <td className="px-4 py-3 text-xs text-muted">
              {l.amountPaise ? (
                <span className="block">
                  {l.currency === "INR" ? "₹" : `${l.currency ?? ""} `}
                  {(l.amountPaise / 100).toLocaleString("en-IN")}
                </span>
              ) : (
                <span className="block">—</span>
              )}
              {l.razorpayPaymentId && <span className="block">Payment: {l.razorpayPaymentId}</span>}
              {l.calendlyEventUri && (
                <a
                  href={l.calendlyEventUri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-accent hover:underline"
                >
                  Calendly event
                </a>
              )}
            </td>
            <td className="px-4 py-3 text-xs text-muted">
              {new Date(l.createdAt).toLocaleString("en-IN")}
              <span className="block">{ageLabel(l.createdAt)}</span>
            </td>
            <td className="px-4 py-3">
              <StatusPill value={l.status} />
            </td>
            <td className="px-4 py-3">
              <div className="flex gap-2">
                {(needsDetailsFollowup || needsSlotFollowup) && (
                  <a
                    href={whatsappHref(l.whatsapp, followupText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-accent px-2 py-1 text-xs text-accent hover:bg-accent hover:text-ink"
                  >
                    WhatsApp
                  </a>
                )}
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
          );
        })}
        {leads.length === 0 && (
          <tr>
            <td colSpan={8} className="px-4 py-8 text-center text-muted">
              No bookings yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </>
  );
}
