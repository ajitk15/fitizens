import Link from "next/link";
import { navLinks } from "@/content/site";
import { getTrainer, getSocials, getSite } from "@/sanity/queries";

export async function Footer() {
  const [trainer, socials, site] = await Promise.all([
    getTrainer(),
    getSocials(),
    getSite(),
  ]);
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-ink-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="font-display text-2xl uppercase tracking-wide">
            FITI<span className="text-accent">ZENS</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            {trainer.shortBio}
          </p>
          <p className="mt-4 text-sm text-muted">
            {trainer.fullName} · {trainer.location}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
            Explore
          </h3>
          <ul className="mt-4 space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted transition-colors hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-fg">
            Get in touch
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={`mailto:${trainer.email}`}
                className="text-muted transition-colors hover:text-accent"
              >
                {trainer.email}
              </a>
            </li>
            <li>
              <a
                href={site.whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-accent"
              >
                WhatsApp: +{trainer.whatsapp}
              </a>
            </li>
            {socials.map((s) => (
              <li key={s.platform}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted transition-colors hover:text-accent"
                >
                  {s.platform} {s.handle}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>
            © {year} {trainer.brand}. All rights reserved.
          </p>
          <p className="text-muted/70">
            Results vary from person to person. Coaching is not a substitute for
            medical advice.
          </p>
        </div>
      </div>
    </footer>
  );
}
