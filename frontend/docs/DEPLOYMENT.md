# Deployment — Vercel production

## Architecture

| Layer | Production (Vercel) | Local dev |
|-------|---------------------|-----------|
| App | Next.js 16 (`frontend/`) | same |
| Cases | Firestore `portal_cases` | SQLite `portal.db` |
| Files | Vercel Blob (`cases/{id}/…`) | `./storage` |
| Staff auth | httpOnly cookie + `SESSION_SECRET` | same |

Server code selects the backend via [lib/server/data-backend.ts](../lib/server/data-backend.ts): Firebase when Admin SDK env vars are set (or `DATA_BACKEND=firebase`), otherwise SQLite.

## Vercel environment variables

### Required (production)

| Variable | Notes |
|----------|--------|
| `FIREBASE_PROJECT_ID` | Firebase project |
| `FIREBASE_CLIENT_EMAIL` | Service account email |
| `FIREBASE_PRIVATE_KEY` | PEM with `\n` newlines |
| `BLOB_READ_WRITE_TOKEN` | From linked Blob store (often auto-injected) |
| `NEXT_PUBLIC_USE_BLOB_UPLOADS` | `true` — client uploads up to 7 MB |
| `STAFF_PASSWORD_HASH` | bcrypt hash |
| `SESSION_SECRET` | Cookie signing secret |

### Strongly recommended

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_APP_URL` | Canonical URL for publish links (`https://…`) |
| `DATA_BACKEND` | `firebase` if auto-detect is ambiguous |

### Optional

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_MAX_CLIENT_FILE_BYTES` | Default 7 MB |
| `NEXT_PUBLIC_FIRM_*` | Branding — [BRANDING.md](./BRANDING.md) |
| `NEXT_PUBLIC_FEATURE_ONEDRIVE_EXPORT` | `true` to show OneDrive export stub |

Do **not** set `DATABASE_URL` or `STORAGE_PATH` on Vercel — they are for local SQLite mode only.

## Vercel project settings

- **Root directory:** `frontend`
- **Build command:** `npm run build`
- **Output:** Next.js default

## Smoke test after deploy

1. `/staff/login` — wrong password rejected; correct password opens cases
2. New case — upload checklist PDF
3. Publish — copy client link
4. Client upload — file appears for staff review
5. Approve all → download zip
6. Delete case (optional) — case and blob prefix removed

## Local vs production

SQLite + disk does not persist on Vercel serverless. Use Firebase + Blob for any shared, durable deployment.

Setup steps: [FIREBASE-SETUP.md](./FIREBASE-SETUP.md). Custom domain: [CUSTOM-DOMAIN.md](./CUSTOM-DOMAIN.md).
