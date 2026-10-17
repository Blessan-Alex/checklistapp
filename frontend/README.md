# Document upload portal

Next.js app for UK immigration caseworkers: upload a UKVI checklist PDF, publish a client link, review uploads, and download a renamed zip pack.

## Local development

1. `cd frontend && npm install`
2. Copy `.env.example` to `.env.local` and set:
   - `STAFF_PASSWORD_HASH` — bcrypt hash for staff login (`node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"`)
   - `SESSION_SECRET` — random string for the staff session cookie
3. `npm run dev` → [http://localhost:3000/staff/login](http://localhost:3000/staff/login)

Cases and files are stored in SQLite (`DATABASE_URL`) and `./storage` (`STORAGE_PATH`).

## Production (Vercel)

Use **Firestore** for case data and **Vercel Blob** for PDFs/uploads. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/FIREBASE-SETUP.md](docs/FIREBASE-SETUP.md).

Set `NEXT_PUBLIC_USE_BLOB_UPLOADS=true` on Vercel so clients can upload up to 7 MB (direct to Blob).

## Scripts

- `npm run build` — production build
- `npm run lint` — ESLint
