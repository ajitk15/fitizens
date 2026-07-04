import Image from "next/image";
import { ButtonLink } from "./Button";
import { Reveal } from "./Reveal";
import { getTrainer } from "@/lib/content";

export async function Hero() {
  const trainer = await getTrainer();
  return (
    <section className="relative overflow-hidden pt-16">
      <div className="accent-radial pointer-events-none absolute inset-0" aria-hidden />
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        {/* Copy */}
        <div className="relative z-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink-card px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {trainer.tagline} · {trainer.location.split(",")[0]}
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 font-display text-5xl uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
              Transform your
              <br />
              <span className="text-accent">body & health</span>
              <br />
              online.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
              Personalized nutrition, workout and supplement plans guided by{" "}
              <em className="not-italic font-semibold text-fg">your blood work</em> — helping you
              lose fat, build muscle, improve metabolic health and manage
              conditions like prediabetes, diabetes, high cholesterol and PCOS
              with <span className="text-accent">science-based coaching</span>.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink href="/contact" size="lg">
                Start Your Transformation
              </ButtonLink>
              <ButtonLink href="/programs" size="lg" variant="secondary">
                View Programs
              </ButtonLink>
            </div>
          </Reveal>
          <Reveal delay={0.32}>
            <p className="mt-6 text-sm text-muted">
              <span className="font-semibold text-fg">10+ years</span> ·{" "}
              <span className="font-semibold text-fg">500+ clients</span> ·{" "}
              INFS Certified
            </p>
          </Reveal>
        </div>

        {/* Image */}
        <Reveal delay={0.2} className="relative">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-md overflow-hidden rounded-3xl border border-line">
            <Image
              src={trainer.profileImage}
              alt={`${trainer.fullName}, ${trainer.tagline}`}
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 440px"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 rounded-xl border border-line bg-ink/80 px-4 py-3 backdrop-blur">
              <p className="font-display text-xl uppercase">{trainer.fullName}</p>
              <p className="text-xs text-muted">{trainer.certifications[0]}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
