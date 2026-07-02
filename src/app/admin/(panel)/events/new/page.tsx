import { AdminHeading } from "@/components/admin/ui";
import { EventForm } from "../EventForm";

export const dynamic = "force-dynamic";

export default function NewEventPage() {
  return (
    <>
      <AdminHeading title="New Event" />
      <EventForm />
    </>
  );
}
