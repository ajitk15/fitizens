import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminCard, AdminHeading, AdminTable, Field, Input, Textarea, SubmitButton } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { saveFaqAction, deleteFaqAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function FaqsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const { edit } = await searchParams;
  const db = getDb();
  const rows = db.select().from(t.faqs).orderBy(asc(t.faqs.displayOrder)).all();
  const editing = edit ? db.select().from(t.faqs).where(eq(t.faqs.id, Number(edit))).get() : undefined;
  const categories = [...new Set(rows.map((r) => r.category))];

  return (
    <>
      <AdminHeading title="FAQs" action={edit ? { href: "/admin/faqs", label: "+ New" } : undefined} />

      <AdminCard title={editing ? "Edit FAQ" : "Add FAQ"}>
        <form action={saveFaqAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Question">
            <Input name="question" defaultValue={editing?.question} required />
          </Field>
          <Field label="Answer">
            <Textarea name="answer" defaultValue={editing?.answer} required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" hint={`Existing: ${categories.join(", ") || "—"}`}>
              <Input name="category" defaultValue={editing?.category ?? "General"} list="faq-categories" />
              <datalist id="faq-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Display order">
              <Input name="displayOrder" type="number" defaultValue={editing?.displayOrder ?? 0} />
            </Field>
          </div>
          <SubmitButton>{editing ? "Save changes" : "Add FAQ"}</SubmitButton>
        </form>
      </AdminCard>

      <div className="mt-8">
        <AdminTable headers={["Question", "Category", "Order", ""]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="max-w-lg px-4 py-3">
                <Link href={`/admin/faqs?edit=${r.id}`} className="font-semibold hover:text-accent">
                  {r.question}
                </Link>
              </td>
              <td className="px-4 py-3 text-muted">{r.category}</td>
              <td className="px-4 py-3 text-muted">{r.displayOrder}</td>
              <td className="px-4 py-3 text-right">
                <DeleteForm action={deleteFaqAction.bind(null, r.id)} confirmText="Delete this FAQ?" />
              </td>
            </tr>
          ))}
        </AdminTable>
      </div>
    </>
  );
}
