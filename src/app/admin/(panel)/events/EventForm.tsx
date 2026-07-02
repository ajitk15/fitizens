import type { schema } from "@/db";
import { AdminCard, Field, Input, Textarea, Select, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { saveEventAction } from "./actions";

type EventRow = typeof schema.events.$inferSelect;

/** datetime-local inputs need "YYYY-MM-DDTHH:mm". */
const toLocal = (iso: string | null | undefined) => (iso ? iso.slice(0, 16) : "");

export function EventForm({ event }: { event?: EventRow }) {
  return (
    <form action={saveEventAction} className="max-w-3xl space-y-6">
      {event && <input type="hidden" name="id" value={event.id} />}
      <AdminCard>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input name="title" defaultValue={event?.title} required />
          </Field>
          <Field label="Slug" hint="Leave empty to generate from the title.">
            <Input name="slug" defaultValue={event?.slug} />
          </Field>
          <Field label="Starts">
            <Input name="startAt" type="datetime-local" defaultValue={toLocal(event?.startAt)} required />
          </Field>
          <Field label="Ends (optional)">
            <Input name="endAt" type="datetime-local" defaultValue={toLocal(event?.endAt)} />
          </Field>
          <Field label="Mode">
            <Select name="mode" defaultValue={event?.mode ?? "online"}>
              <option value="online">Online</option>
              <option value="in-person">In person</option>
            </Select>
          </Field>
          <Field label="Location" hint='e.g. "Zoom" or "Gachibowli, Hyderabad"'>
            <Input name="location" defaultValue={event?.location ?? "Online"} />
          </Field>
          <Field label="Price (₹)" hint="0 = free event.">
            <Input name="price" type="number" min={0} step="1" defaultValue={event ? event.pricePaise / 100 : 0} />
          </Field>
          <Field label="Capacity" hint="Leave empty for unlimited seats.">
            <Input name="capacity" type="number" min={1} defaultValue={event?.capacity ?? ""} />
          </Field>
          <Field label="Status" hint="Only published events appear on the site.">
            <Select name="status" defaultValue={event?.status ?? "draft"}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </Select>
          </Field>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Summary" hint="Short teaser shown on the events list.">
            <Textarea name="summary" defaultValue={event?.summary} required />
          </Field>
          <Field label="Description (Markdown)">
            <Textarea name="description" rows={10} defaultValue={event?.descriptionMd} className="font-mono text-xs" />
          </Field>
          <ImageUploadField name="image" label="Event image" defaultValue={event?.image ?? ""} />
        </div>
      </AdminCard>
      <SubmitButton>{event ? "Save event" : "Create event"}</SubmitButton>
    </form>
  );
}
