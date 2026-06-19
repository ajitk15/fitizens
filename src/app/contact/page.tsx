import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { LeadForm } from "@/components/LeadForm";
import { CalendlyEmbed } from "@/components/CalendlyEmbed";
import { ConsultationPayment } from "@/components/ConsultationPayment";
import { getTrainer, getSite, getConsultation } from "@/sanity/queries";

export const metadata: Metadata = {
  title: "Contact & Book a Consultation",
  description:
    "Book a consultation call with FITIZENS. Share your goals and I'll build a custom online coaching plan for fat loss, muscle gain or lifestyle health.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [trainer, site, consultation] = await Promise.all([
    getTrainer(),
    getSite(),
    getConsultation(),
  ]);
  return (
    <>
      <section className="relative overflow-hidden pt-28">
        <div className="accent-radial pointer-events-none absolute inset-0" aria-hidden />
        <div className="mx-auto max-w-6xl px-4 pb-6 sm:px-6">
          <SectionHeading
            eyebrow="Contact & Booking"
            title={<>Let&apos;s build <span className="text-accent">your plan</span></>}
            subtitle={`Tell me about your goals and I'll get back to you on WhatsApp. Prefer to talk first? Book a ${consultation.durationLabel} consultation call.`}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Lead form */}
          <Reveal>
            <LeadForm />
          </Reveal>

          {/* Booking + payment + direct contact */}
          <div className="space-y-8">
            <Reveal delay={0.1}>
              <ConsultationPayment consultation={consultation} />
            </Reveal>

            <Reveal delay={0.15}>
              <div>
                <h3 className="mb-3 font-display text-xl uppercase">
                  Or pick a slot directly
                </h3>
                <CalendlyEmbed url={site.calendlyUrl} />
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="rounded-2xl border border-line bg-ink-card p-6">
                <h3 className="font-display text-xl uppercase">Reach me directly</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li className="flex items-center gap-3">
                    <span className="text-accent">WhatsApp</span>
                    <a
                      href={site.whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted transition-colors hover:text-accent"
                    >
                      +{trainer.whatsapp}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent">Email</span>
                    <a
                      href={`mailto:${trainer.email}`}
                      className="text-muted transition-colors hover:text-accent"
                    >
                      {trainer.email}
                    </a>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-accent">Location</span>
                    <span className="text-muted">{trainer.location} · Online worldwide</span>
                  </li>
                </ul>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
