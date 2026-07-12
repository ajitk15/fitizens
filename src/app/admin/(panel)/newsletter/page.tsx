import { desc } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminCard, AdminHeading, AdminTable, Field, Input, Textarea, StatusPill, SubmitButton } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { smtpConfigured } from "@/lib/mail";
import { sendNewsletterAction, deleteSubscriberAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewsletterAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; total?: string; failed?: string; error?: string }>;
}) {
  const { sent, total, failed, error } = await searchParams;
  const subscribers = getDb()
    .select()
    .from(t.subscribers)
    .orderBy(desc(t.subscribers.id))
    .all();
  const active = subscribers.filter((s) => s.status === "subscribed").length;

  return (
    <>
      <AdminHeading title="Newsletter" />

      {sent != null && (
        <p className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-4 py-2 text-sm text-ok">
          Newsletter sent to {sent} of {total} subscriber{Number(total) === 1 ? "" : "s"}
          {Number(failed) > 0 ? ` (${failed} failed — check the server logs)` : ""}.
        </p>
      )}
      {error === "missing" && (
        <p className="mb-4 rounded-lg border border-bad/40 bg-bad/10 px-4 py-2 text-sm text-bad">
          Subject and message are both required.
        </p>
      )}
      {!smtpConfigured() && (
        <p className="mb-4 rounded-lg border border-line bg-ink-card px-4 py-2 text-sm text-muted">
          ⚠ SMTP is not configured (<code>SMTP_HOST/PORT/USER/PASS</code>), so newsletters are
          logged to the server console instead of actually being emailed.
        </p>
      )}

      <AdminCard title={`Send a newsletter (${active} active subscriber${active === 1 ? "" : "s"})`}>
        <form action={sendNewsletterAction} className="space-y-4">
          <Field label="Subject">
            <Input name="subject" required placeholder="e.g. 5 habits that make fat loss stick" />
          </Field>
          <Field label="Message" hint="Plain text — leave a blank line between paragraphs.">
            <Textarea name="message" rows={8} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button label (optional)" hint='e.g. "Read the full post"'>
              <Input name="ctaLabel" />
            </Field>
            <Field label="Button link (optional)">
              <Input name="ctaUrl" type="url" placeholder="https://…" />
            </Field>
          </div>
          <p className="text-xs text-muted/70">
            Every email is sent individually with the subscriber&apos;s own unsubscribe link.
          </p>
          <SubmitButton>Send newsletter</SubmitButton>
        </form>
      </AdminCard>

      <div className="mt-8">
        <AdminTable headers={["Email", "Name", "Source", "Status", "Since", ""]}>
          {subscribers.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 font-semibold">{s.email}</td>
              <td className="px-4 py-3 text-muted">{s.name ?? "—"}</td>
              <td className="px-4 py-3 text-muted">{s.source}</td>
              <td className="px-4 py-3">
                <StatusPill value={s.status} />
              </td>
              <td className="px-4 py-3 text-xs text-muted">
                {new Date(s.createdAt).toLocaleDateString("en-IN")}
              </td>
              <td className="px-4 py-3 text-right">
                <DeleteForm
                  action={deleteSubscriberAction.bind(null, s.id)}
                  confirmText={`Delete subscriber "${s.email}"?`}
                />
              </td>
            </tr>
          ))}
          {subscribers.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-8 text-center text-muted">
                No subscribers yet — signups come from the footer box and the consultation
                form opt-in.
              </td>
            </tr>
          )}
        </AdminTable>
      </div>
    </>
  );
}
