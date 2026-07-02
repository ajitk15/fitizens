import { desc } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { AdminHeading, AdminTable, StatusPill } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function OrdersAdminPage() {
  const orders = getDb().select().from(t.orders).orderBy(desc(t.orders.id)).all();
  return (
    <>
      <AdminHeading title="Orders" />
      <AdminTable headers={["Order", "Customer", "Amount", "Kind", "Status", "Updated"]}>
        {orders.map((o) => (
          <tr key={o.id}>
            <td className="px-4 py-3">
              <span className="font-mono text-xs">{o.razorpayOrderId}</span>
              {o.razorpayPaymentId && (
                <span className="block font-mono text-xs text-muted">{o.razorpayPaymentId}</span>
              )}
            </td>
            <td className="px-4 py-3">
              {o.customerName ?? "—"}
              {o.customerEmail && <span className="block text-xs text-muted">{o.customerEmail}</span>}
              {o.customerPhone && <span className="block text-xs text-muted">{o.customerPhone}</span>}
            </td>
            <td className="px-4 py-3">
              ₹{(o.amountPaise / 100).toLocaleString("en-IN")}
            </td>
            <td className="px-4 py-3 text-muted">{o.kind}</td>
            <td className="px-4 py-3">
              <StatusPill value={o.status} />
              {o.error && <span className="block text-xs text-red-400">{o.error}</span>}
            </td>
            <td className="px-4 py-3 text-xs text-muted">
              {new Date(o.updatedAt).toLocaleString("en-IN")}
            </td>
          </tr>
        ))}
        {orders.length === 0 && (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-muted">
              No orders yet.
            </td>
          </tr>
        )}
      </AdminTable>
    </>
  );
}
