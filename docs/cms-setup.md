# Content editing (Sanity CMS) — setup & handoff

The site content (trainer profile, programs, transformations, testimonials, FAQs,
socials, consultation, SEO settings) is editable by **non-technical users** through
a **Sanity Studio** embedded at **`/studio`** — no code or redeploys needed.

Until a Sanity project is connected, the site automatically renders the bundled
defaults in `src/content/site.ts`, so nothing breaks before setup is finished.

---

## How it works

```
Editor → yoursite.com/studio  →  edits + uploads images  →  Publish
                                                              │
                                  Sanity webhook ────────────►  /api/revalidate
                                                              │
                                  live site refreshes (no redeploy)
```

- Pages fetch content via async getters in `src/sanity/queries.ts`, each of which
  falls back to `src/content/site.ts` if Sanity is unavailable.
- Reads are cached and tagged `"sanity"`; the publish webhook calls
  `revalidateTag("sanity", { expire: 0 })` so edits appear within seconds.

---

## One-time setup (developer)

### 1. Create the Sanity project
```bash
npx sanity login          # opens browser; sign in with Google/GitHub/email
npx sanity init --bare    # choose "Create new project" → note the Project ID, dataset = production
```

### 2. Create tokens (sanity.io/manage → your project → API → Tokens)
- **Viewer** token → `SANITY_API_READ_TOKEN`
- **Editor** token → `SANITY_API_WRITE_TOKEN` (used only by the seed script)
- Invent a random string → `SANITY_REVALIDATE_SECRET`

### 3. Fill in env (`.env.local`, and the same values in Vercel → Settings → Environment Variables)
See `.env.example` for the full list:
```
NEXT_PUBLIC_SANITY_PROJECT_ID=xxxxxxxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=...
SANITY_API_WRITE_TOKEN=...
SANITY_REVALIDATE_SECRET=...
```

### 4. Allow the Studio origins (sanity.io/manage → API → CORS origins)
Add `http://localhost:3000` and your production URL (e.g. `https://fitizens.in`),
both **with credentials**.

### 5. Seed the existing content + images
```bash
npx tsx scripts/seed.ts
```
This uploads `public/images/image1–4.jpeg` and creates all documents from the
current `site.ts` content. Idempotent — safe to re-run.

### 6. Configure the publish webhook (sanity.io/manage → API → Webhooks → Create)
- **URL:** `https://<your-domain>/api/revalidate`
- **Trigger on:** Create, Update, Delete
- **HTTP method:** POST
- **Secret:** the same `SANITY_REVALIDATE_SECRET`

---

## Day-to-day editing (client)

1. Go to `https://<your-domain>/studio` and log in.
2. Edit in the left-hand sections:
   - **Trainer Profile** — bio, photos, stats, contact details (single document)
   - **Programs**, **Transformations**, **Testimonials**, **FAQs**, **Social Links** — lists you can add/remove/reorder
   - **Consultation Call**, **Site Settings** — single documents
3. Drag-drop images directly into image fields.
4. Click **Publish**. The live site updates within seconds.

> Tip: set **Display order** on list items to control how they appear on the site.
> For transformations, only tick **Client consent given** once the client has
> approved the use of their before/after photos.

---

## Notes
- `/studio` is excluded from search engines (noindex + robots disallow).
- Removing the Sanity env vars instantly reverts the site to the bundled defaults.
- React 19 / Next 16: pinned `sanity` + `next-sanity` versions are React-19
  compatible. If a future Studio upgrade conflicts, run the Studio standalone
  (`npx sanity dev`) instead of the embedded route.
