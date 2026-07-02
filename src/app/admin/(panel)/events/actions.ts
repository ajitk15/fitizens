"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema as t } from "@/db";
import { auditedMutation } from "@/lib/admin";
import { str, num, optNum, slugify } from "@/lib/forms";

function parse(formData: FormData) {
  const title = str(formData, "title");
  // Price entered in rupees; stored in paise for Razorpay.
  const priceRupees = num(formData, "price", 0);
  return {
    slug: str(formData, "slug") || slugify(title),
    title,
    summary: str(formData, "summary"),
    descriptionMd: String(formData.get("description") ?? ""),
    image: str(formData, "image") || null,
    location: str(formData, "location") || "Online",
    mode: str(formData, "mode") === "in-person" ? "in-person" : "online",
    startAt: str(formData, "startAt"),
    endAt: str(formData, "endAt") || null,
    capacity: optNum(formData, "capacity"),
    pricePaise: Math.round(priceRupees * 100),
    currency: "INR",
    status: str(formData, "status") || "draft",
    updatedAt: new Date().toISOString(),
  };
}

export async function saveEventAction(formData: FormData) {
  const db = getDb();
  const id = num(formData, "id", 0);
  const values = parse(formData);
  if (!values.startAt) throw new Error("Start date/time is required.");

  if (id) {
    await auditedMutation({
      action: "update",
      entityType: "event",
      before: () => db.select().from(t.events).where(eq(t.events.id, id)).get(),
      run: () => db.update(t.events).set(values).where(eq(t.events.id, id)).run(),
      entityId: () => id,
      after: () => db.select().from(t.events).where(eq(t.events.id, id)).get(),
    });
    redirect(`/admin/events/${id}?saved=1`);
  } else {
    const result = await auditedMutation({
      action: "create",
      entityType: "event",
      run: () => db.insert(t.events).values({ ...values, createdAt: values.updatedAt }).run(),
      entityId: (r) => Number(r.lastInsertRowid),
      after: (r) => db.select().from(t.events).where(eq(t.events.id, Number(r.lastInsertRowid))).get(),
    });
    redirect(`/admin/events/${Number(result.lastInsertRowid)}?saved=1`);
  }
}

export async function deleteEventAction(id: number) {
  const db = getDb();
  if (!id) return;
  await auditedMutation({
    action: "delete",
    entityType: "event",
    before: () => db.select().from(t.events).where(eq(t.events.id, id)).get(),
    run: () => {
      db.delete(t.eventRegistrations).where(eq(t.eventRegistrations.eventId, id)).run();
      db.delete(t.events).where(eq(t.events.id, id)).run();
    },
    entityId: () => id,
  });
  redirect("/admin/events");
}
