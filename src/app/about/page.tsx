import type { Metadata } from "next";
import Image from "next/image";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { ButtonLink } from "@/components/Button";
import { StatsBar } from "@/components/StatsBar";
import { getTrainer } from "@/sanity/queries";

export async function generateMetadata(): Promise<Metadata> {
  const trainer = await getTrainer();
  return {
    title: "About",
    description: `${trainer.fullName} — ${trainer.tagline} in ${trainer.location}. ${trainer.shortBio}`,
    alternates: { canonical: "/about" },
  };
}

export default async function AboutPage() {
  const trainer = await getTrainer();
  return (
    <>
      <section className="relative overflow-hidden pt-24">
        <div className="accent-radial pointer-events-none absolute inset-0" aria-hidden />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="About"
              title={<>Meet <span className="text-accent">{trainer.fullName}</span></>}
              subtitle={trainer.tagline + " · " + trainer.location}
            />
            <div className="mt-6 space-y-4">
              {trainer.bio.map((para, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <p className="leading-relaxed text-muted">{para}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.3} className="mt-8">
              <ButtonLink href="/contact" size="lg">
                Work With Me
              </ButtonLink>
            </Reveal>
          </div>

          <Reveal delay={0.15} className="relative">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl border border-line">
              <Image
                src={trainer.galleryImages[1]}
                alt={trainer.fullName}
                fill
                sizes="(max-width:1024px) 90vw, 440px"
                className="object-cover"
                priority
              />
            </div>
          </Reveal>
        </div>
      </section>

      <StatsBar />

      {/* Philosophy + certifications */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal className="rounded-2xl border border-line bg-ink-card p-8">
            <h3 className="font-display text-2xl uppercase">My Philosophy</h3>
            <p className="mt-4 leading-relaxed text-muted">{trainer.philosophy}</p>
            <p className="mt-4 leading-relaxed text-muted">{trainer.bio[2]}</p>
          </Reveal>
          <Reveal delay={0.1} className="rounded-2xl border border-line bg-ink-card p-8">
            <h3 className="font-display text-2xl uppercase">Certifications</h3>
            <ul className="mt-4 space-y-3">
              {trainer.certifications.map((c) => (
                <li key={c} className="flex gap-3 text-muted">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-accent" aria-hidden>
                    <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-line pt-6 text-sm text-muted">
              <p>Email: <a className="text-accent hover:underline" href={`mailto:${trainer.email}`}>{trainer.email}</a></p>
              <p className="mt-1">WhatsApp: +{trainer.whatsapp}</p>
            </div>
          </Reveal>
        </div>

        {/* Gallery strip */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {trainer.galleryImages.map((img, i) => (
            <Reveal key={img} delay={i * 0.06} className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line">
              <Image src={img} alt={`${trainer.fullName} training`} fill sizes="(max-width:640px) 45vw, 260px" className="object-cover" />
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
