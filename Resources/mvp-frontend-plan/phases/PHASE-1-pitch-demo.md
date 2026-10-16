# Phase 1 — Pitch demo (functional frontend, mock backend)

**Duration:** ~1–2 weeks  
**Goal:** Founder-ready, **clickable product** that tells the full story without SQLite or real zip.

**plan.md alignment:** UI for §3, §6 (general + minimum per-slot text), §7 slot trees, §9 pages — see [`../PLAN-COVERAGE.md`](../PLAN-COVERAGE.md). Backend §4 parse / §12 core loop ship in **Phase 2**.

## Outcome

A deployable static/Next app (Vercel OK) where a presenter can walk [`../DEMO-SCRIPT.md`](../DEMO-SCRIPT.md) without embarrassment.

## What “functional” means here

| Works | Faked |
|-------|-------|
| All routes navigable | PDF parsing (use prefilled JSON after fake delay) |
| Slot lists for SW + ILR | Real file storage |
| Instructions + don’ts visible | Zip binary (show **mock file list** modal) |
| Upload UI (file picker) | Server persistence (optional: `localStorage` for same-browser return) |
| Progress bar updates | Email notifications |
| Copy client link to clipboard | Auth (optional: any password → enter) |

## Deliverables

1. **Repo folder** `app/` or `frontend/` scaffold (Next.js + Tailwind + shadcn).
2. **Mock cases:** `case-dino.json`, `case-sophy.json` from Resources metadata.
3. **All screens** in [`../SCREEN-INVENTORY.md`](../SCREEN-INVENTORY.md) marked P1.
4. **Demo mode** banner + case switcher + “Simulate client done”.
5. **Hosted URL** for founder (optional password on Vercel).

## Build checklist

### Week A — Shell + staff

- [ ] Project init, ESLint, Tailwind, shadcn Button/Card/Table/Dialog/Badge.
- [ ] `AppShellStaff`, `AppShellClient`, firm placeholder logo.
- [ ] `/staff/login` — submit → `sessionStorage` flag → redirect.
- [ ] `/staff/cases` — table from mock array (2 cases).
- [ ] `/staff/cases/new` — PDF dropzone → 1.5s spinner → navigate to review with seeded fields.
- [ ] `/staff/cases/[id]/review` — edit UAN, name, route radio, dependant toggle (SW only).
- [ ] `SlotTable` from JSON config `skilled-worker.slots.json` / `ilr.slots.json`.
- [ ] Publish dialog → generate fake token → show copy link.

### Week B — Client + polish

- [ ] `/c/[token]` — resolve token to mock case; wrong token → 404 page.
- [ ] `InstructionPanel` with `general.md` content (Share Code bullet verbatim).
- [ ] `/c/[token]/slot/[slotId]` — instructions, donts, placeholder sample image, UploadDropzone.
- [ ] On file select: update in-memory (or localStorage) slot.upload → hub progress.
- [ ] Finish page disabled until all `clientUpload` slots filled; cover letter excluded.
- [ ] `/c/[token]/done` thank you.
- [ ] Staff `/staff/cases/[id]` — read client progress from shared store; “Download zip” opens modal listing target filenames.
- [ ] Mobile pass: client hub + slot usable at 375px width.
- [ ] Deploy + README run instructions.

## Config to author in Phase 1

| File | Content |
|------|---------|
| `skilled-worker.slots.json` | 10 rows per plan (mark cover as non-upload) |
| `ilr.slots.json` | 9 rows per Sophy sample |
| `instructions/general.md` | Plan §6.2 |
| Per-slot snippets | sharecode, evisa, passport, ho-consent (short) |

## Acceptance criteria

- [ ] Founder can complete demo script in **under 6 minutes** without developer help.
- [ ] Switching Dino ↔ Sophy changes **slot count and labels** visibly.
- [ ] Share Code instruction mentions **immigration matter** / not right to rent.
- [ ] No dead links; every button goes somewhere sensible.

## Not in Phase 1

- Real API, database, virus scan, docx generation.
- Add-slot modal (can stub “Coming in Phase 2” or simple alert).

## Handoff to Phase 2

- Same routes and components; replace `MockCaseRepository` with `fetch('/api/...')`.
- Keep mock JSON as **fixtures** for tests and Storybook.
