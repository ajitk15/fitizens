import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { ButtonLink } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { TransformationsGallery } from "@/components/TransformationsGallery";
import { getTransformations } from "@/lib/content";
import { assertPageVisible } from "@/lib/pages";

export const metadata: Metadata = {
  title: "Transformations",
  description:
    "Real client transformations coached online by FITIZENS — fat loss, muscle gain and body recomposition. Drag to compare before and after.",
  alternates: { canonical: "/transformations" },
};


export const dynamic = "force-dynamic";
export default async function TransformationsPage() {
  await assertPageVisible("transformations");
  const transformations = await getTransformations();
  return (
    <>
      <section className="relative overflow-hidden pt-28">
        <div className="accent-radial pointer-events-none absolute inset-0" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <SectionHeading
            align="center"
            eyebrow="Transformations"
            title="The proof is in the progress"
            subtitle="Filter by goal and drag the slider to compare. Sample images are shown for now — real, consented client transformations will appear here."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <TransformationsGallery items={transformations} />

        <Reveal className="mt-16 rounded-2xl border border-accent/40 bg-ink-card p-8 text-center shadow-glow">
          <h2 className="font-display text-2xl uppercase sm:text-3xl">
            Your transformation could be next
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Book a consultation call and let&apos;s build the plan that gets you
            there.
          </p>
          <ButtonLink href="/contact" size="lg" className="mt-6">
            Start Now
          </ButtonLink>
        </Reveal>
      </section>
    </>
  );
}
