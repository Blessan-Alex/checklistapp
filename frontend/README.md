# L-Cedar Immigration — frontend

Next.js App Router UI for the immigration document checklist (staff + client portals).

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The home route redirects to `/staff/login`.

**Founder demo:** step-by-step URLs in [DEMO.md](./DEMO.md).

**Phase 2 API mode:** copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_USE_MOCK_STORE=false`, then `npm run dev`. Staff login uses `STAFF_PASSWORD_HASH` when set. Client uploads persist via API (`POST /api/client/.../upload`); staff zip via `GET /api/cases/[id]/zip`.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Dev server (port **3000**) |
| `npm run build`| Production build         |
| `npm run start`| Serve production build   |
| `npm run lint` | ESLint                   |

## Brand

Colors and typography come from `../mvp-frontend-plan/assets/` (KHB colour palette + Archivo SemiCondensed). Tokens live in `lib/theme/`; font files in `app/fonts/`. Do not add Google Fonts or colors outside that palette.

## Structure

- `app/` — routes (`staff/`, `c/[token]/`, …), `fonts/`
- `components/` — UI shells and feature components
- `config/` — routes, instructions, mock data
- `lib/` — constants, types, utilities
- `public/samples/` — sample PDFs for client download (see repo `Resources/`)

Product planning docs live in `../mvp-frontend-plan/`.

## Deploy (Vercel + GitHub)

Full audit and phased plan: **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**.

**Quick path (free Vercel Hobby, founder demo):**

1. Push this repo; in Vercel set **Root Directory** = `frontend`.
2. Set `NEXT_PUBLIC_USE_MOCK_STORE=true` (default).
3. Optionally set `NEXT_PUBLIC_APP_URL` to your production URL.

Do **not** set `NEXT_PUBLIC_USE_MOCK_STORE=false` on Vercel until SQLite/files are replaced with Firestore (or Turso) + cloud storage — see deployment doc.
