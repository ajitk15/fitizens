# FITIZENS — Personal Trainer Website

Marketing & lead-generation website for **FITIZENS** (online fitness trainer
**Satya Muddena**, Hyderabad). Built with Next.js (App Router) + Tailwind CSS +
Framer Motion. Dark-first design with an electric-orange accent.

Reference brief and the client's filled questionnaire live in [`/docs`](./docs).

---

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in keys as accounts become available
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx           # fonts, global SEO metadata, JSON-LD, header/footer/CTAs
│  ├─ page.tsx             # Home (hero, stats, about, programs, how-it-works,
│  │                       #       transformations, testimonials, FAQ, CTA)
│  ├─ about/               # About / credibility
│  ├─ programs/            # Package listing + /programs/[slug] detail pages
│  ├─ transformations/     # Filterable before/after gallery
│  ├─ contact/             # Multi-step lead form + Calendly + payment + contacts
│  ├─ api/lead/            # Lead capture → email (SMTP)
│  ├─ api/payment/         # Razorpay order creation (stubbed until keys set)
│  ├─ sitemap.ts, robots.ts, not-found.tsx
│  └─ globals.css          # Tailwind v4 theme (@theme): colours, fonts
├─ components/             # Header, Footer, StickyCTA, WhatsAppButton,
│                          # AnimatedCounter, Reveal, BeforeAfterSlider,
│                          # ProgramCard, FaqAccordion, TestimonialCarousel,
│                          # TransformationsGallery, Hero, LeadForm,
│                          # CalendlyEmbed, ConsultationPayment, …
└─ content/site.ts         # ⭐ ALL site content/data (edit copy here)
```

**To change any copy, prices, FAQs, stats, packages or links, edit
[`src/content/site.ts`](./src/content/site.ts).** It is the single source of
truth and is fully typed.

---

## Features built (Phases 1 + 2)

- Multi-page site: Home, About, Programs (+ detail pages), Transformations, Contact.
- Interactivity: animated stat counters, scroll-reveal sections, draggable
  before/after slider, testimonial carousel, FAQ accordion, sticky "Book a Call"
  CTA, floating WhatsApp button, smooth-scroll sticky header with mobile menu.
- Conversion: multi-step lead form, paid-consultation flow, Calendly embed.
- SEO: per-page metadata + Open Graph/Twitter, canonical URLs, `sitemap.xml`,
  `robots.txt`, and JSON-LD (`Person` + `LocalBusiness`).
- Accessibility: keyboard-operable slider/accordion/nav, alt text,
  `prefers-reduced-motion` respected.

Design decision: **prices are intentionally hidden** (per client request). Cards
show "Enquire for pricing" + a consultation CTA. Real prices are stored in
`site.ts` (`programs[].price`) and can be surfaced later by editing
`ProgramCard.tsx`.

---

## Integrations — what needs the client's accounts/keys

All of these degrade gracefully: the site runs and looks complete without them.
Configure in `.env.local` (see `.env.example`).

| Feature | Env vars | Until configured |
|---|---|---|
| **Lead emails** | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `LEAD_TO_EMAIL` | Form works; leads are logged server-side instead of emailed. Defaults recipient to `satya.muddena@gmail.com`. |
| **Calendly booking** | `NEXT_PUBLIC_CALENDLY_URL` | Shows a "calendar coming soon" placeholder; users book via the form/WhatsApp. |
| **Razorpay payment** | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Pay button shows a "payments coming soon" notice (`/api/payment` returns `enabled:false`). |
| **Site URL** | `NEXT_PUBLIC_SITE_URL` | Defaults to `https://fitizens.in` for canonical/OG/sitemap. |

> ⚠️ Payment go-live also needs server-side **signature verification** before
> confirming a booking — see the `TODO` in `ConsultationPayment.tsx`
> (`/api/payment/verify`). Do not treat the client `handler` callback as proof
> of payment.

---

## Content still needed from the client (placeholders in place)

- Final **bio / about** text and **brand colours/fonts/logo** (currently
  spec defaults: dark + orange, Anton + Inter).
- **Real testimonials** (quote, name, rating, result) — currently placeholders.
- **Before/after transformation photos with written consent** — the gallery
  currently reuses the trainer's photos as samples (`placeholder: true`).
- **Calendly**, **Razorpay**, **SMTP/email** accounts.
- **Domain & hosting** (recommended: Vercel), and **legal pages**
  (privacy policy, terms, health/results disclaimer).

---

## Not in this build (future phases)

- Phase 3: BMI/calorie calculators, program-finder quiz.
- Phase 4: headless CMS, blog, live Instagram feed, analytics (GA4/Meta Pixel),
  A/B testing.

---

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel; it auto-detects Next.js.
3. Add the environment variables from `.env.example` in Vercel project settings.
4. Point the client's domain at the Vercel project.
