"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
// Mobile menu closes via link click handlers (below) rather than a route effect.
import { navLinks } from "@/content/site";
import { ButtonLink } from "./Button";

export function Header({ ctaLabel = "Book a Consultation" }: { ctaLabel?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open
          ? "border-b border-line bg-ink/90 backdrop-blur"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-2xl uppercase tracking-wide">
          FITI<span className="text-accent">ZENS</span>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-accent ${
                    active ? "text-accent" : "text-fg"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden md:block">
          <ButtonLink href="/contact" size="md">
            {ctaLabel}
          </ButtonLink>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-fg md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="relative block h-4 w-5">
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-ink md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium hover:bg-ink-card hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              <ButtonLink href="/contact" size="lg" className="w-full" onClick={() => setOpen(false)}>
                {ctaLabel}
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
