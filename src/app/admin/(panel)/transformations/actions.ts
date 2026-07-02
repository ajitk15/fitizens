"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb, schema as t } from "@/db";
import { auditedMutation } from "@/lib/admin";
import { str, num, bool } from "@/lib/forms";

function parse(formData: FormData) {
  return {
    clientName: str(formData, "clientName"),
    beforeImage: str(formData, "beforeImage"),
    afterImage: str(formData, "afterImage"),
    goal: str(formData, "goal") || "fat-loss",
    durationWeeks: num(formData, "durationWeeks"),
    summary: str(formData, "summary"),
    consentGiven: bool(formData, "consentGiven"),
    featured: bool(formData, "featured"),
    placeholder: false,
    displayOrder: num(formData, "displayOrder"),
  };
}

export async function saveTransformationAction(formData: FormData) {
  const db = getDb();
  const id = num(formData, "id", 0);
  const values = parse(formData);
  if (id) {
    await auditedMutation({
      action: "update",
      entityType: "transformation",
      before: () => db.select().from(t.transformations).where(eq(t.transformations.id, id)).get(),
      run: () => db.update(t.transformations).set(values).where(eq(t.transformations.id, id)).run(),
      entityId: () => id,
      after: () => db.select().from(t.transformations).where(eq(t.transformations.id, id)).get(),
    });
  } else {
    await auditedMutation({
      action: "create",
      entityType: "transformation",
      run: () => db.insert(t.transformations).values(values).run(),
      entityId: (r) => Number(r.lastInsertRowid),
      after: (r) =>
        db
          .select()
          .from(t.transformations)
          .where(eq(t.transformations.id, Number(r.lastInsertRowid)))
          .get(),
    });
  }
  redirect("/admin/transformations");
}

export async function deleteTransformationAction(id: number) {
  const db = getDb();
  if (!id) return;
  await auditedMutation({
    action: "delete",
    entityType: "transformation",
    before: () => db.select().from(t.transformations).where(eq(t.transformations.id, id)).get(),
    run: () => db.delete(t.transformations).where(eq(t.transformations.id, id)).run(),
    entityId: () => id,
  });
  redirect("/admin/transformations");
}
