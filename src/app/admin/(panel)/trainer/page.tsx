import { asc } from "drizzle-orm";
import { getDb, schema as t } from "@/db";
import { getTrainer } from "@/lib/content";
import { AdminCard, AdminHeading, Field, Input, Textarea, SubmitButton } from "@/components/admin/ui";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { StatsEditor } from "@/components/admin/StatsEditor";
import { GalleryEditor } from "@/components/admin/GalleryEditor";
import { updateTrainerAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function TrainerAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, trainer] = await Promise.all([searchParams, getTrainer()]);
  const stats = getDb().select().from(t.stats).orderBy(asc(t.stats.displayOrder)).all();
  const statRows = stats.map((s) => ({
    label: s.label,
    value: s.value as number | "",
    suffix: s.suffix ?? "",
    prefix: s.prefix ?? "",
  }));

  return (
    <>
      <AdminHeading title="Trainer Profile" />
      {saved && (
        <p className="mb-4 rounded-lg border border-ok/40 bg-ok/10 px-4 py-2 text-sm text-ok">
          Saved.
        </p>
      )}
      <form action={updateTrainerAction} className="max-w-3xl space-y-6">
        <AdminCard title="Identity">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input name="fullName" defaultValue={trainer.fullName} required />
            </Field>
            <Field label="Brand">
              <Input name="brand" defaultValue={trainer.brand} required />
            </Field>
            <Field label="Tagline">
              <Input name="tagline" defaultValue={trainer.tagline} required />
            </Field>
            <Field label="Years of experience">
              <Input name="yearsExperience" type="number" defaultValue={trainer.yearsExperience} />
            </Field>
            <Field label="Location">
              <Input name="location" defaultValue={trainer.location} />
            </Field>
            <Field label="Email">
              <Input name="email" type="email" defaultValue={trainer.email} />
            </Field>
            <Field label="WhatsApp (digits only)" hint="Used for wa.me links, e.g. 919999999999">
              <Input name="whatsapp" defaultValue={trainer.whatsapp} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Bio & philosophy">
          <div className="space-y-4">
            <Field label="Short bio" hint="Used in page metadata and the hero.">
              <Textarea name="shortBio" defaultValue={trainer.shortBio} />
            </Field>
            <Field label="Bio paragraphs" hint="One paragraph per line.">
              <Textarea name="bio" rows={6} defaultValue={trainer.bio.join("\n")} />
            </Field>
            <Field label="Philosophy" hint="Separate paragraphs with a blank line.">
              <Textarea name="philosophy" rows={6} defaultValue={trainer.philosophy} />
            </Field>
            <Field label="Certifications" hint="One per line.">
              <Textarea name="certifications" defaultValue={trainer.certifications.join("\n")} />
            </Field>
          </div>
        </AdminCard>

        <AdminCard title="Images">
          <div className="space-y-4">
            <ImageUploadField name="profileImage" label="Profile image" kind="profile" defaultValue={trainer.profileImage} />
            <ImageUploadField
              name="certificateImage"
              label="Certificate image"
              kind="program"
              defaultValue={trainer.certificateImage ?? ""}
            />
            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted">
                Gallery images (About page)
              </span>
              <GalleryEditor name="galleryImages" initial={trainer.galleryImages} />
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Stats bar">
          <StatsEditor name="stats" initial={statRows} />
        </AdminCard>

        <SubmitButton>Save profile</SubmitButton>
      </form>
    </>
  );
}
