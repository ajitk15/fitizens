# FITIZENS — Personal Trainer Website (self-hosted)

Marketing & lead-generation website for **FITIZENS** (online fitness trainer
**Satya Muddena**, Hyderabad) with a **built-in admin panel** — no external CMS
or third-party services required. Next.js (App Router) + Tailwind CSS + Framer
Motion + **SQLite**. Dark-first design with an electric-orange accent.

Everything the site shows — trainer profile, email & phone, social links,
programs, transformations, testimonials, FAQs, blog posts, events, prices — is
editable at **`/admin`** and reflects across the whole site immediately.

---

## Getting started

```bash
npm install
cp .env.example .env.local   # set ADMIN_EMAIL + ADMIN_PASSWORD at minimum
npm run dev                  # http://localhost:3000  (admin at /admin)
```

On first boot the app creates `data/fitizens.db`, applies migrations, seeds it
with the bundled default content (`src/content/site.ts`) and creates the admin
user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Seeding is idempotent — it never
overwrites your edits.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
npx tsx scripts/seed.ts        # initialize the DB without starting the app
npx drizzle-kit generate       # regenerate SQL migrations after schema changes
```

---

## Architecture

```
src/
├─ app/
│  ├─ (site)/               # public pages (Home, About, Programs, Events,
│  │                        #   Transformations, Blog, Tools, Contact)
│  ├─ admin/                # built-in admin panel (login + CRUD + audit log)
│  ├─ api/
│  │  ├─ lead/              # lead capture → DB + email
│  │  ├─ events/register/   # event registration (free + paid)
│  │  ├─ payment/order      # Razorpay order creation (amounts derived server-side)
│  │  ├─ payment/verify     # HMAC signature verification (never trust the client)
│  │  ├─ payment/webhook    # Razorpay webhook safety net (raw-body HMAC)
│  │  └─ admin/upload       # image uploads (content-hashed, stored in DATA_DIR)
│  └─ uploads/[...path]/    # serves uploaded images
├─ components/              # public UI + components/admin/* primitives
├─ content/site.ts          # typed default content (used to seed + as fallback)
├─ db/                      # Drizzle schema, SQLite bootstrap, seeding
├─ lib/                     # content getters, auth, audit, mail, razorpay
└─ proxy.ts                 # /admin cookie redirect (auth enforced in-request)
drizzle/                    # generated SQL migrations (applied on boot)
data/                       # SQLite DB + uploads (gitignored; volume in Docker)
```

- **Database**: SQLite via better-sqlite3 + Drizzle ORM. Single file at
  `${DATA_DIR:-./data}/fitizens.db` (WAL mode). No external database service.
- **Auth**: single admin user, scrypt-hashed password, DB-backed sessions with
  hashed tokens in an httpOnly cookie. Every admin action re-checks the session.
- **Audit**: append-only `audit_log` records every content change (with
  before/after), login attempt, lead, registration and payment event —
  browsable at `/admin/audit`.
- **Payments**: Razorpay via its REST API (no SDK). Order amounts are always
  derived server-side; success requires HMAC signature verification
  (`/api/payment/verify`), with `/api/payment/webhook` as the safety net for
  dropped clients. Orders are persisted with full lifecycle status.
- **Events**: post bootcamps/workshops in `/admin/events`; visitors register on
  `/events/<slug>` — free events confirm instantly, paid events confirm after
  payment. Capacity is enforced. Attendees get email confirmations (when SMTP
  is configured).
- **Blog**: markdown body, edited in `/admin/posts`, rendered with the same
  typography as before.
- **Graceful degradation**: without SMTP/Razorpay/Instagram keys the site runs
  fully — email logs to console, pay buttons show "coming soon", the Instagram
  section shows a follow card.

---

## Deploy (Render — chosen strategy)

The repo ships a [render.yaml](./render.yaml) blueprint: a Docker web service
with a 1 GB persistent disk mounted at `/data` (SQLite DB + uploaded images).

1. Push this repo to GitHub.
2. Render dashboard → **New → Blueprint** → select the repo. Render reads
   `render.yaml` and prompts for the secrets (`ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `NEXT_PUBLIC_SITE_URL`; SMTP/Razorpay whenever ready).
3. Deploy. First boot migrates + seeds the database and creates the admin
   user. Point the domain at the service (Render → Settings → Custom Domains).

Notes:
- The persistent disk requires a paid instance (Starter, ~$7/mo + disk).
- With a disk attached, Render runs a single instance — exactly right for
  SQLite. Back up the disk from the Render dashboard (Disks → Snapshots).
- Razorpay webhook URL after go-live:
  `https://<your-domain>/api/payment/webhook`.

### Alternative: any Docker host

```bash
docker build -t fitizens .
docker run -d --name fitizens -p 3000:3000 \
  -v fitizens-data:/data \
  -e ADMIN_EMAIL=you@example.com \
  -e ADMIN_PASSWORD=strong-password \
  -e NEXT_PUBLIC_SITE_URL=https://fitizens.in \
  fitizens
```

Put a reverse proxy (Caddy/Nginx/Traefik) with TLS in front, and back up the
`fitizens-data` volume.

> ⚠️ **Serverless hosts (Netlify/Vercel) are not supported** by this build:
> SQLite and local uploads need a persistent disk and a long-lived Node
> process.

---

## Environment variables

See [.env.example](./.env.example). Only `ADMIN_EMAIL` / `ADMIN_PASSWORD` are
required to get a working site + admin. SMTP (lead/receipt emails), Razorpay
(payments) and analytics IDs can be added whenever the accounts are ready.

For Razorpay go-live: set `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and create
a webhook in the Razorpay dashboard pointing at
`https://<domain>/api/payment/webhook` (events `payment.captured` +
`payment.failed`) with `RAZORPAY_WEBHOOK_SECRET`.

---

## Editing content

Everything is at **`/admin`**:

| Section | What it controls |
|---|---|
| Trainer | Name, tagline, bio, **email**, **WhatsApp number**, certifications, photos, stats bar |
| Programs | Coaching packages (cards, detail pages, prices) |
| Transformations | Before/after gallery (with consent flag) |
| Testimonials | Client quotes and ratings |
| FAQs | Q&A by category |
| Socials | **Instagram / YouTube / Facebook /…** links shown in the footer & JSON-LD |
| Blog Posts | Markdown articles |
| Events | Bootcamps/workshops with price, capacity and status |
| Registrations / Orders / Leads | Inboxes for everything visitors submit |
| Settings | Site URL, SEO keywords, consultation price |
| Audit Log | Who changed what, when, with before/after |

Design decision: **program prices are intentionally hidden** on the public site
(cards show "Enquire for pricing"); they're stored per program in the admin.
