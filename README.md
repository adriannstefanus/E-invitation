# Wedding invitation

Mobile-first wedding invitation site. Personalized guest name is read from `?to=` — no backend in v1.

## Requirements

- Node.js 22 LTS (or 20+)
- pnpm (`corepack enable` then `corepack prepare pnpm@10.33.3 --activate`, or install pnpm another way)

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and check phone widths (360 / 375 / 390 / 414 / 430). Try a guest name:

```
http://localhost:3000?to=Andi
```

Other scripts: `pnpm lint`, `pnpm format`, `pnpm build`.

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

## Guest attendance (later)

Not built yet. If it happens, keep this invitation as the public site and add:

- Supabase (guest list from CSV)
- A staff check-in route such as `/staff`

Personalized links (`?to=Name`) stay frontend-only and do not need that work.

## Deploy

Vercel is the intended host (HTTPS + Open Graph). Wire a custom domain after the first deploy.
