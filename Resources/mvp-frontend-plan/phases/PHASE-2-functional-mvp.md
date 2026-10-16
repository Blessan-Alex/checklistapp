# Phase 2 — Functional MVP (frontend + API)

**Duration:** ~3–4 weeks  
**Goal:** Real cases on a pilot: upload, save for later, client finish, staff zip download.

**Implements plan.md §12 Phase 1 (core loop)** + §4 parsing UI, §10 API, §11 validation — see [`../PHASE-MAPPING.md`](../PHASE-MAPPING.md).

## Outcome

Same UI as Phase 1, wired to **Next.js API routes** + **SQLite** + **local disk** storage (per [`../../plan.md`](../../plan.md) §10).

## Frontend work

### API integration

- [ ] React Query (or SWR) for all case/slot/upload endpoints.
- [ ] Optimistic UI on upload start; rollback on error.
- [ ] **Saved ✓** after successful `POST /api/slots/[id]/upload`.
- [ ] Client hub polls or refetches on focus (returning later).
- [ ] Staff case list reflects live client progress %.

### Upload UX (real)

- [ ] Enforce **7 MB** client-side before request; server validates again.
- [ ] Accept `.pdf`, `.jpg`, `.jpeg`, `.png`.
- [ ] Show upload progress bar for slow connections.
- [ ] Replace file: confirm dialog → delete old + upload new.

### Staff flows

- [ ] Real login session (httpOnly cookie).
- [ ] New case: `POST` multipart checklist PDF → server parse → return fields → review page.
- [ ] Review: `PATCH` case + slots → `POST publish` → real token.
- [ ] Case detail: **Download zip** triggers `GET /api/cases/[id]/zip` (spinner, then file).

### Client flows

- [ ] Token-only access; no staff session leakage.
- [ ] Finish: `POST /api/client/[token]/submit` → redirect done → UI locked.
- [ ] Error states: 413 too large, 401 bad token.

### Parsing feedback UI

- [ ] Show extracted UAN, name, product line, suggested route.
- [ ] Highlight **low confidence** → staff must confirm route before publish.

## Backend (paired with FE — minimal list)

Frontend depends on these endpoints existing:

| Method | Path | FE use |
|--------|------|--------|
| POST | `/api/auth/login` | Staff login |
| GET | `/api/cases` | Dashboard |
| POST | `/api/cases` | Upload checklist |
| GET/PATCH | `/api/cases/[id]` | Review save |
| POST | `/api/cases/[id]/publish` | Link |
| GET | `/api/client/[token]` | Client hub |
| POST | `/api/client/[token]/slots/[id]/upload` | Upload |
| POST | `/api/client/[token]/submit` | Finish |
| GET | `/api/cases/[id]/zip` | Staff download |

## Acceptance criteria

- [ ] Client can close browser, reopen link, see prior uploads.
- [ ] Staff downloads zip with renamed files matching slot `targetFileName`.
- [ ] Checklist PDF appears under zip `Misc/`.
- [ ] Pilot: **one real Skilled Worker + one real ILR** case end-to-end.

## Not in Phase 2

- Sample image library on every slot (Phase 3).
- Cover letter preview/generation UI (server may stub empty cover file or skip).
- Add-slot UI (optional: ship simple modal if time).
- Internal guidance drawer (static copy OK in review sidebar).

## Risk mitigations

| Risk | FE handling |
|------|-------------|
| Slow upload | Disable double-submit; show % |
| Parse wrong route | Force manual route on review |
| Client confusion | Keep Phase 1 instruction text |
