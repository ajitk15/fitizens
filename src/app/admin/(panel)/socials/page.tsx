import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminCard, AdminHeading, AdminTable, Field, Input, SubmitButton } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { saveSocialAction, deleteSocialAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function SocialsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const db = getDb();
  const rows = db.select().from(t.socials).orderBy(asc(t.socials.displayOrder)).all();
  const editing = edit
    ? db.select().from(t.socials).where(eq(t.socials.id, Number(edit))).get()
    : undefined;

  return (
    <>
      <AdminHeading title="Social Links" action={edit ? { href: "/admin/socials", label: "+ New" } : undefined} />

      <AdminCard title={editing ? `Edit: ${editing.platform}` : "Add social link"}>
        <form action={saveSocialAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Platform" hint="e.g. Instagram, YouTube">
              <Input name="platform" defaultValue={editing?.platform} required />
            </Field>
            <Field label="Handle" hint="e.g. @satya_muddena">
              <Input name="handle" defaultValue={editing?.handle} required />
            </Field>
            <Field label="URL">
              <Input name="url" type="url" defaultValue={editing?.url} required />
            </Field>
            <Field label="Followers (optional)">
              <Input name="followers" type="number" defaultValue={editing?.followers ?? ""} />
            </Field>
            <Field label="Display order">
              <Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
            </Field>
          </div>
          <SubmitButton>{editing ? "Save changes" : "Add link"}</SubmitButton>
        </form>
      </AdminCard>

      <div className="mt-8">
        <AdminTable headers={["Platform", "Handle", "URL", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3">
                <Link href={`/admin/socials?edit=${r.id}`} className="font-semibold hover:text-accent">
                  {r.platform}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{r.handle}</td>
              <td className="max-w-xs truncate px-4 py-3 text-muted">{r.url}</td>
              <td className="px-4 py-3 text-right">
                <DeleteForm action={deleteSocialAction.bind(null, r.id)} confirmText={`Delete ${r.platform}?`} />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </>
  );
}
