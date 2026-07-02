import { eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { getConsultation, getSite } from "@/lib/content";
import { AdminCard, AdminHeading, Field, Input, Textarea, Select, Checkbox, SubmitButton } from "@/components/admin/ui";
import { DAYS } from "@/lib/constants";
import { saveSettingsAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SettingsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, site, consultation] = await Promise.all([
    searchParams,
    getSite(),
    getConsultation(),
  ]);
  const settings = getDb().select().from(t.siteSettings).where(eq(t.siteSettings.id, 1)).get();

  return (
    <>
      <AdminHeading title="Settings" />
      {saved && (
        <p className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-4 py-2 text-sm text-ok">
          Saved.
        </p>
      )}
      <form action={saveSettingsAction} className="max-w-2xl space-y-6">
        <AdminCard title="Site">
          <div className="space-y-4">
            <Field label="Site URL" hint="Canonical URL for SEO — e.g. https://fitizens.in">
              <Input name="siteUrl" type="url" defaultValue={settings?.siteUrl ?? ""} placeholder={site.url} />
            </Field>
            <Field label="SEO keywords" hint="One per line.">
              <Textarea name="keywords" rows={5} defaultValue={site.keywords.join("\n")} />
            </Field>
            <Field
              label="Booking button label"
              hint='Used by every booking button across the site — e.g. "Book a Consultation" or "Book a Call".'
            >
              <Input name="ctaLabel" defaultValue={site.ctaLabel} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Home-page welcome popup">
          <div className="space-y-4">
            <Checkbox
              name="popupEnabled"
              label="Show the popup to first-time visitors on the home page"
              defaultChecked={site.popup.enabled}
            />
            <Field label="Title">
              <Input name="popupTitle" defaultValue={site.popup.title} />
            </Field>
            <Field label="Message">
              <Textarea name="popupBody" defaultValue={site.popup.body} />
            </Field>
            <div>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted">
                Available slots
              </span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Select name="popupDayFrom" defaultValue={settings?.popupDayFrom ?? "Mon"} aria-label="From day">
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Select name="popupDayTo" defaultValue={settings?.popupDayTo ?? "Sat"} aria-label="To day">
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Input name="popupTimeFrom" type="time" defaultValue={settings?.popupTimeFrom ?? "16:00"} aria-label="From time" />
                <Input name="popupTimeTo" type="time" defaultValue={settings?.popupTimeTo ?? "20:00"} aria-label="To time" />
              </div>
              <span className="mt-1 block text-xs text-muted/70">
                Shown as: {site.popup.slots}
              </span>
            </div>
            <Field label="Note" hint='Second info line — e.g. "Strictly one-on-one…"'>
              <Input name="popupNote" defaultValue={site.popup.note} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Consultation call">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (₹)">
              <Input name="price" type="number" defaultValue={consultation.price} />
            </Field>
            <Field label="Currency">
              <Select name="currency" defaultValue={consultation.currency}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </Select>
            </Field>
            <Field label="Duration label" hint="e.g. 30 minutes">
              <Input name="durationLabel" defaultValue={consultation.durationLabel} />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Note" hint="Shown under the price on the contact page.">
              <Textarea name="note" defaultValue={consultation.note} />
            </Field>
          </div>
        </AdminCard>

        <SubmitButton>Save settings</SubmitButton>
      </form>
    </>
  );
}
