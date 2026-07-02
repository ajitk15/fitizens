import Link from "next/link";
import { desc } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";
import { DeleteForm } from "@/components/admin/DeleteForm";
import { deletePostAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function PostsAdminPage() {
  const posts = getDb().select().from(t.posts).orderBy(desc(t.posts.publishedAt)).all();
  return (
    <>
      <AdminHeading title="Blog Posts" action={{ href: "/admin/posts/new", label: "+ New post" }} />
      <AdminTable headers={["Title", "Category", "Published", "Status", ""]}>
        {posts.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3">
              <Link href={`/admin/posts/${p.id}`} className="font-semibold hover:text-accent">
                {p.title}
              </Link>
              <span className="block text-xs text-muted">/blog/{p.slug}</span>
            </td>
            <td className="px-4 py-3 text-muted">{p.category ?? "—"}</td>
            <td className="px-4 py-3 text-muted">{p.publishedAt.slice(0, 10)}</td>
            <td className="px-4 py-3">
              <StatusPill value={p.isPublished ? "published" : "draft"} />
            </td>
            <td className="px-4 py-3 text-right">
              <DeleteForm action={deletePostAction.bind(null, p.id)} confirmText={`Delete "${p.title}"?`} />
            </td>
          </tr>
        ))}
        {posts.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-muted">
              No posts yet — write your first article.
            </td>
          </tr>
        )}
      </AdminTable>
    </>
  );
}
