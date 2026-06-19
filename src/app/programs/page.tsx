import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { ProgramCard } from "@/components/ProgramCard";
import { ButtonLink } from "@/components/Button";
import { FaqAccordion } from "@/components/FaqAccordion";
import { programs, faqs, consultation } from "@/content/site";

export const metadata: Metadata = {
  title: "Programs & Packages",
  description:
    "Online coaching packages from FITIZENS — 12, 24 and 52 week plans with custom nutrition, training and supplement protocols built around your blood work.",
  alternates: { canonical: "/programs" },
};

const packageFaqs = faqs.filter((f) => f.category === "Package Details" || f.category === "Services Provided");

export default function ProgramsPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-28">
        <div className="accent-radial pointer-events-none absolute inset-0" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <SectionHeading
            align="center"
            eyebrow="Coaching Packages"
            title="Pick your plan"
            subtitle="Every package includes the same complete, hands-on support. The longer the plan, the more time we have for a full, lasting transformation. Pricing is shared during your consultation."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {programs.map((p) => (
            <Reveal key={p.slug} delay={p.displayOrder * 0.08}>
              <ProgramCard program={p} />
            </Reveal>
          ))}
        </div>

        {/* Consultation banner */}
        <Reveal className="mt-12 rounded-2xl border border-accent/40 bg-ink-card p-8 text-center shadow-glow">
          <h2 className="font-display text-2xl uppercase sm:text-3xl">
            Start with a consultation call
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            A {consultation.durationLabel} call for ₹
            {consultation.price.toLocaleString("en-IN")}. {consultation.note}
          </p>
          <ButtonLink href="/contact" size="lg" className="mt-6">
            Book Your Consultation
          </ButtonLink>
        </Reveal>
      </section>

      <section className="border-t border-line bg-ink-soft">
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
          <SectionHeading align="center" eyebrow="FAQ" title="Package questions" className="mb-12" />
          <FaqAccordion faqs={packageFaqs} />
        </div>
      </section>
    </>
  );
}
