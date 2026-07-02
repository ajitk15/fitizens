import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { goalLabels, type Goal } from "@/content/site";
import { AdminCard, AdminHeading, AdminTable, Field, Input, Textarea, Select, Checkbox, SubmitButton, StatusPill } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { saveTransformationAction, deleteTransformationAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TransformationsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const db = getDb();
  const rows = db.select().from(t.transformations).orderBy(asc(t.transformations.displayOrder)).all();
  const editing = edit
    ? db.select().from(t.transformations).where(eq(t.transformations.id, Number(edit))).get()
    : undefined;

  return (
    <>
      <AdminHeading
        title="Transformations"
        action={edit ? { href: "/admin/transformations", label: "+ New" } : undefined}
      />

      <AdminCard title={editing ? `Edit: ${editing.clientName}` : "Add transformation"}>
        <form action={saveTransformationAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client name">
              <Input name="clientName" defaultValue={editing?.clientName} required />
            </Field>
            <Field label="Goal">
              <Select name="goal" defaultValue={editing?.goal ?? "fat-loss"}>
                {(Object.keys(goalLabels) as Goal[]).map((g) => (
                  <option key={g} value={g}>
                    {goalLabels[g]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Duration (weeks)">
              <Input name="durationWeeks" type="number" defaultValue={editing?.durationWeeks ?? 12} />
            </Field>
            <Field label="Display order">
              <Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
            </Field>
          </div>
          <Field label="Summary">
            <Textarea name="summary" defaultValue={editing?.summary} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField name="beforeImage" label="Before photo" kind="transformation" defaultValue={editing?.beforeImage ?? ""} />
            <ImageUploadField name="afterImage" label="After photo" kind="transformation" defaultValue={editing?.afterImage ?? ""} />
          </div>
          <div className="flex gap-6">
            <Checkbox name="consentGiven" label="Client consent on file" defaultChecked={editing?.consentGiven ?? false} />
            <Checkbox name="featured" label="Featured on homepage" defaultChecked={editing?.featured ?? false} />
          </div>
          <SubmitButton>{editing ? "Save changes" : "Add transformation"}</SubmitButton>
        </form>
      </AdminCard>

      <div className="mt-8">
        <AdminTable headers={["Client", "Goal", "Weeks", "Consent", "Featured", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3">
                <Link href={`/admin/transformations?edit=${r.id}`} className="font-semibold hover:text-accent">
                  {r.clientName}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{goalLabels[r.goal as Goal] ?? r.goal}</td>
              <td className="px-4 py-3 text-muted">{r.durationWeeks}</td>
              <td className="px-4 py-3">{r.consentGiven ? <StatusPill value="confirmed" /> : <StatusPill value="draft" />}</td>
              <td className="px-4 py-3">{r.featured ? "★" : ""}</td>
              <td className="px-4 py-3 text-right">
                <DeleteForm action={deleteTransformationAction.bind(null, r.id)} confirmText={`Delete "${r.clientName}"?`} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </>
  );
}
