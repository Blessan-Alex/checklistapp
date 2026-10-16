# Deployment audit — GitHub, Vercel (free), and cloud data

This document maps **what you have today**, what works on **Vercel Hobby (free)** without changes, and what you must **replace** for shared persistence (Firebase Spark or alternatives).

---

## Executive summary

| Goal | Recommendation |
|------|----------------|
| **Founder demo live URL (fastest)** | Vercel + `NEXT_PUBLIC_USE_MOCK_STORE=true` (default). No Firebase required. |
| **Real multi-user / shared cases on serverless** | Do **not** use local SQLite + `./storage` on Vercel. Use **Firestore (Spark) + Vercel Blob** (implemented). |
| **Firebase free plan** | Use **Spark** for Firestore + Storage (+ optional Auth). Host the app on **Vercel**, not Firebase Hosting (one host is enough). |

---

## Current architecture (as implemented)

| Layer | Technology | Where data lives |
|-------|------------|------------------|
| UI | Next.js 16 App Router (`frontend/`) | — |
| **Demo mode (default)** | `localStorage` mock store | Each visitor’s browser only |
| **API mode** | Route handlers under `app/api/*` | — |
| **API persistence** | `better-sqlite3` → `DATABASE_URL` file | `frontend/data/portal.db` |
| **Uploads / PDFs / zips** | Node `fs` → `STORAGE_PATH` | `frontend/storage/cases/{id}/` |
| **Staff auth (API)** | httpOnly cookie + `SESSION_SECRET` | Cookie |
| **Staff auth (mock)** | `sessionStorage` + password `demo` | Browser |

Repository abstraction exists (`CaseRepository`, `sqlite-case-repository`, `mock-case-repository`) — good for swapping storage later.

---

## Vercel free (Hobby) — what works today

### Works with zero backend changes

Set in Vercel **Environment Variables** (Production + Preview):

```env
NEXT_PUBLIC_USE_MOCK_STORE=true
```

Optional branding (see `docs/BRANDING.md`):

```env
NEXT_PUBLIC_FIRM_NAME=Your Firm Name
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

**Behaviour:** Staff login (`demo`), Dino/Sophy cases, client links, uploads, zip manifest demo — all in the **browser**. Each device has its own data. Perfect for **founder pitch URL**.

**Build:** Root directory = `frontend`, build command `npm run build`, output = Next.js default.

### Does **not** work on Vercel as-is (API mode)

If you set `NEXT_PUBLIC_USE_MOCK_STORE=false`:

| Component | Why it fails on serverless |
|-----------|----------------------------|
| `lib/db/database.ts` + `better-sqlite3` | DB file on ephemeral disk; not shared across instances; wiped on cold start |
| `STORAGE_PATH` / `lib/server/case-storage.ts` | Same — no durable disk |
| `pdf-parse` / large uploads | Hobby **4.5 MB** request body limit on Serverless Functions (your client max is 7 MB — already above limit for API uploads) |
| Native `better-sqlite3` | Adds build complexity; still doesn’t fix persistence |

**Do not enable API mode on Vercel until storage is migrated.**

---

## Firebase Spark (free) — what to use it for

Firebase **Hosting** is optional; you already chose **Vercel** for Next.js.

| Firebase product | Replaces | Free tier (Spark) — typical limits |
|------------------|----------|-----------------------------------|
| **Firestore** | SQLite `cases` table + `data_json` | 1 GiB storage, 50K reads / 20K writes per day |
| **Cloud Storage** | `STORAGE_PATH` files | 5 GB, 1 GB/day download |
| **Authentication** (optional) | Staff password cookie | Free; email/password or Google for staff only |
| **App Check** (later) | — | Bot abuse on client upload APIs |

**Client portal** can stay **token-in-URL** (no Firebase Auth for clients) — matches current design.

---

## Replacement map (audit → implementation phases)

### Phase A — GitHub + Vercel demo (no Firebase)

**Code changes:** None required.

1. Initialize git at repo root (or `frontend/` only).
2. Push to GitHub; connect repo in Vercel; set **Root Directory** = `frontend`.
3. Env: `NEXT_PUBLIC_USE_MOCK_STORE=true`, `NEXT_PUBLIC_APP_URL=https://<prod-domain>`.
4. Smoke test: `/staff/login` → cases → `/c/demo-dino`.

**Security note:** Mock mode is a **public demo** — anyone with the URL can use staff password `demo`. For a semi-private demo, set a strong staff password only after API mode + real auth.

---

### Phase B — Production persistence (Firebase Spark on Vercel) — **implemented**

Code paths:

- `lib/repositories/firestore-case-repository.ts` — Firestore `portal_cases`
- `lib/server/case-blob-storage.ts` — Vercel Blob vs local disk
- `lib/server/data-backend.ts` — auto-selects Firebase when env vars are set
- `lib/server/case-repository-server.ts` — single entry for all API routes

**Setup:** follow **[FIREBASE-SETUP.md](./FIREBASE-SETUP.md)** step by step.

Client uploads on Vercel are capped at **4 MB** by default (`lib/constants.ts`).

---

### Phase C — Alternatives to Firebase (also free-tier friendly)

| Stack | Pros | Cons |
|-------|------|------|
| **Turso** (libSQL) + **Vercel Blob** | Minimal SQL migration from SQLite JSON | Another vendor; learn Turso |
| **Supabase** Postgres + Storage | SQL, dashboard | Slightly more setup than Firestore for document JSON |
| **Neon** Postgres + Blob | Familiar SQL | Same as Supabase pattern |

Your case model is already **JSON in one row** — Firestore documents are a natural fit.

---

## Environment variable checklist (Vercel)

### Demo (Phase A)

| Variable | Required | Value |
|----------|----------|--------|
| `NEXT_PUBLIC_USE_MOCK_STORE` | Yes | `true` |
| `NEXT_PUBLIC_APP_URL` | Recommended | `https://your-app.vercel.app` (stable client links in emails) |

### API local dev only (not Vercel until Phase B)

| Variable | Required |
|----------|----------|
| `DATABASE_URL` | Yes (`file:./data/portal.db`) |
| `STORAGE_PATH` | Yes (`./storage`) |
| `SESSION_SECRET` | Yes in production API |
| `STAFF_PASSWORD_HASH` | Strongly recommended |

---

## GitHub repository layout

Recommended **monorepo**:

```text
Checklist App/
  frontend/          ← Vercel Root Directory
  mvp-frontend-plan/ ← product docs (commit)
  Resources/         ← sample PDFs (if license allows)
```

**Do not commit:** `frontend/node_modules`, `frontend/.next`, `frontend/.env*`, `frontend/data/`, `frontend/storage/`.

---

## Known gaps vs product phases (not deployment blockers)

| Item | Status |
|------|--------|
| Phase 1–4 UI (mock) | Complete for demo |
| Phase 2 API on Vercel | **Blocked** until cloud DB + blob storage |
| OneDrive export | Stub behind feature flag |
| `multiRoute` / `clientPin` flags | Reserved, not wired |
| Middleware → `proxy` | Next 16 deprecation warning only |
| Lighthouse ≥ 90 mobile | Optional polish |

---

## Suggested order of operations

1. **Today:** Git init → GitHub → Vercel (mock mode) → share preview URL with founder.
2. **Before pilot (5 real cases):** Phase B Firebase (or Turso+Blob); signed uploads; `STAFF_PASSWORD_HASH` + `SESSION_SECRET`.
3. **Later:** Custom domain (`docs/CUSTOM-DOMAIN.md`), Firebase App Check, staff Firebase Auth.

---

## Quick Vercel project settings

| Setting | Value |
|---------|--------|
| Framework | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Node.js Version | 20.x |

No `vercel.json` required for Phase A.
