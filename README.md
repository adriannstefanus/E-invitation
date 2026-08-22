# Wedding invitation

Mobile-first wedding invitation site. Personal invites use `/g/[token]`. `?to=Name` is a display-only fallback.

## Requirements

- Node.js 22 LTS (or 20+)
- pnpm (`corepack enable` then `corepack prepare pnpm@10.33.3 --activate`, or install pnpm another way)

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and check phone widths (360 / 375 / 390 / 414 / 430).

Other scripts: `pnpm lint`, `pnpm format`, `pnpm build`.

## Database and admin

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Copy [`.env.example`](.env.example) to `.env.local` and fill the keys plus `ADMIN_PASSWORD` and `ADMIN_SECRET`.
4. Restart `pnpm dev`.

Staff: [http://localhost:3000/admin](http://localhost:3000/admin)

Add guests (and type: regular / vip / family / vendor), then open each guest to copy `/g/...` and the QR. Guests show that QR at the door; staff scan it on **Door**.

`?to=Andi` still works for a nameless preview without a token.

## Media

Each section is one full screen. After **Open Invitation**, swipe up to snap to the next section.

| Kind              | Where                                                                          | Git         |
| ----------------- | ------------------------------------------------------------------------------ | ----------- |
| Camera originals  | [`originals/`](originals/)                                                     | ignored     |
| Compressed photos | [`public/media/images/`](public/media/images/)                                 | commit WebP |
| Preview videos    | [`public/media/videos/`](public/media/videos/)                                 | ignored     |
| Production videos | CDN (R2 / Bunny / Cloudinary), URL in [`src/data/media.ts`](src/data/media.ts) | n/a         |

Use the filenames listed in [`public/media/README.md`](public/media/README.md). Missing files stay as placeholders. Do not put raw photos or long videos in `public/`.

Photos: WebP, about 1200–1600px. Videos: short muted loop, ~720p, a few MB.

WhatsApp preview: add `public/og.jpg` (1200×630) later and point `openGraph.images` at it in `src/app/layout.tsx`.

## Deploy

Vercel is the intended host (HTTPS + Open Graph). Wire a custom domain after the first deploy.
