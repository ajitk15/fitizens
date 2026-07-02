import Link from "next/link";
import { asc } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { deleteProgramAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProgramsAdminPage() {
  const programs = getDb().select().from(t.programs).orderBy(asc(t.programs.displayOrder)).all();
  return (
    <>
      <AdminHeading title="Programs" action={{ href: "/admin/programs/new", label: "+ New program" }} />
      <AdminTable headers={["Title", "Duration", "Price (₹)", "Popular", "Order", ""]}>
        {programs.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3">
              <Link href={`/admin/programs/${p.id}`} className="font-semibold hover:text-accent">
                {p.title}
              </Link>
              <span className="block text-xs text-muted">/{p.slug}</span>
            </td>
            <td className="px-4 py-3 text-muted">{p.durationLabel}</td>
            <td className="px-4 py-3 text-muted">{p.price.toLocaleString("en-IN")}</td>
            <td className="px-4 py-3">{p.popular ? <StatusPill value="popular" /> : <span className="text-muted">—</span>}</td>
            <td className="px-4 py-3 text-muted">{p.displayOrder}</td>
            <td className="px-4 py-3 text-right">
              <DeleteForm
                action={deleteProgramAction.bind(null, p.id)}
                confirmText={`Delete "${p.title}"?`}
                label="Delete"
              />
            </td>
          </tr>
        ))}
      </AdminTable>
    </>
  );
}
