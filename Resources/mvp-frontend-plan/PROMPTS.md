# Next.js frontend — chained build prompts

Use these prompts **in order** with Cursor Agent (or a developer). Each prompt assumes the **previous** prompt is complete and starts with a **verification gate**.

**Product docs (read when cited):** [`README.md`](README.md), [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md), [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md), [`CLIENT-INSTRUCTIONS.md`](CLIENT-INSTRUCTIONS.md), [`SCREEN-INVENTORY.md`](SCREEN-INVENTORY.md), [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md), [`phases/`](phases/).

**Brand assets (required for all UI work):** [`assets/`](assets/) — `KHB_ColorPalette.jpg` (primary / secondary / accent hex values) and `Typography/Archivo_SemiCondensed-*.ttf`. **Extract every color and typeface from these files only.** Do not use Google Fonts, Geist, or ad-hoc palettes. Copy needed `.ttf` weights into `frontend/app/fonts/`, centralize hex tokens in `frontend/lib/theme/brand.ts` + `brand.css`, and map shadcn/Tailwind semantic tokens (`primary`, `background`, `accent`, etc.) to that palette.

**Goal:** Phase 1 gives the **founder the full app experience** (staff + client, Dino + Sophy, instructions, samples, mock zip). Phases 2–4 replace mocks with API and polish.

**App location:** create the Next.js app at repo root as `frontend/` (or `app/` if you prefer — stay consistent).

---

## How to run a prompt

1. Copy **one** prompt block (from `### Prompt …` through its **VERIFY** section).
2. Paste into Agent mode.
3. Run **VERIFY** steps manually or ask the agent to run them.
4. Only proceed when every checkbox in VERIFY passes.
5. Run the next prompt.

---

## Global verification commands (after Phase 1 scaffold exists)

```bash
cd frontend
npm run build
npm run lint
npm run dev
```

Founder demo URL flow: `/staff/login` → cases → Dino review → publish → `/c/{token}` → uploads → finish → staff zip modal.

---

# PHASE 1 — Founder-complete demo (mock backend)

*Target: [`phases/PHASE-1-pitch-demo.md`](phases/PHASE-1-pitch-demo.md). No SQLite yet.*

---

### Prompt 1.0 — Scaffold Next.js + design system

**Before you start:** Confirm the repo has `mvp-frontend-plan/` (including **`assets/`** colour + typography), and `Resources/` (Skilled worker + ILR samples). No `frontend/` app yet.

**Task:**

1. Create `frontend/` with **Next.js 14+ App Router**, TypeScript, Tailwind, ESLint.
2. Initialize **shadcn/ui** (Button, Card, Table, Dialog, Badge, Progress, Sheet, Alert, Input, Label, RadioGroup, Checkbox, Separator, Tabs).
3. **Brand theme (Khenbridge):** Read `mvp-frontend-plan/assets/KHB_ColorPalette.jpg` and wire **only** those hex values into `lib/theme/brand.ts` + `brand.css` → shadcn CSS variables. Load **Archivo SemiCondensed** via `next/font/local` from copied files under `app/fonts/` (source: `assets/Typography/`). Firm name placeholder: **L-Cedar Immigration** (configurable constant).
4. Folder structure:

```text
frontend/
  app/
    layout.tsx
    page.tsx                    → redirect to /staff/login
    fonts/                      → Archivo SemiCondensed .ttf (from assets/Typography)
    staff/...
    c/...
  components/
    shells/
    staff/
    client/
    shared/
  lib/
    constants.ts
    types.ts
    utils.ts                    → targetFileName builder, sanitize filename
    theme/
      brand.ts                  → hex tokens from assets/KHB_ColorPalette.jpg
      brand.css
  config/
    routes/
    instructions/
    mock/
  public/
    samples/
```

5. Root `README.md` in `frontend/`: `npm install`, `npm run dev`, port 3000.

**VERIFY:**

- [ ] `npm run build` succeeds.
- [ ] `/` redirects to staff login or shows clear entry.
- [ ] shadcn components import without error.
- [ ] UI uses **only** `assets/` palette + Archivo SemiCondensed (no external fonts/colors).

---

### Prompt 1.1 — Types, slot configs, mock cases (Dino + Sophy)

**Before you start:** Prompt **1.0** VERIFY passed.

**Task:**

1. Implement `lib/types.ts` matching [`INFORMATION-ARCHITECTURE.md`](INFORMATION-ARCHITECTURE.md) (`Case`, `Slot`, `Route`, `CaseStatus`).
2. Add `lib/target-filename.ts`: `{sortNumber} {documentName} {personFirstName?}` + Windows char sanitize.
3. Create **`config/routes/skilled-worker.slots.json`** — full tree from [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md) (10 rows; slot 3 Cover Letter `clientUpload: false`).
4. Create **`config/routes/ilr.slots.json`** — 9 rows; slot 9 Cover Letter not client upload.
5. Create **`config/instructions/general.md`** — verbatim from [`CLIENT-INSTRUCTIONS.md`](CLIENT-INSTRUCTIONS.md) §6.2.
6. Create **`config/instructions/by-slot-type/`**: `passport.md`, `sharecode.md`, `evisa.md`, `ho-consent.md`, `brp.md`, `cos.md`, `marriage.md`, plus ILR types (`absence-letter.md`, `travel-ticket.md`, `payslip.md`, `bank.md`, `employer-letter.md`).
7. Create **`config/mock/case-dino.json`** and **`case-sophy.json`** with real metadata from Resources PDFs:
   - Dino: UAN `1212-0001-6479-0157`, Skilled Worker, dependant pack, partner **Aparna**, tokens, slots merged from SW template with first names **Dino** / **Aparna**.
   - Sophy: UAN `1212-0001-6466-5462`, ILR, first name **Sophy**, ILR slots.
8. Add **`lib/mock-store.ts`**: in-memory + **`localStorage`** persistence key `document-portal-demo-v1` for client uploads and case publish state (so founder can refresh and see progress).

**VERIFY:**

- [ ] JSON validates; Dino has **9** client-upload slots (excl. cover); Sophy has **8**.
- [ ] Sharecode instruction text includes **“To prove an immigration matter”** and **not** right to rent/work.
- [ ] `targetFileName` for slot examples: `7 Sharecode Dino`, `1 Sophy Passport` (ILR naming from samples).

---

### Prompt 1.2 — Placeholder sample images (founder-visible)

**Before you start:** Prompt **1.1** VERIFY passed.

**Task:**

1. Add **`public/samples/`** assets (can be simple generated placeholders with labels, or exported redacted crops — each file must exist):
   - `passport-four-edges.svg` or `.png`
   - `sharecode-immigration-matter.svg` (annotate: correct GOV.UK option)
   - `evisa-dates-visible.svg`
   - `brp-example.svg`
   - `ho-consent-signed-example.svg`
   - `marriage-cert.svg`
   - `bank-statement.svg`, `payslip.svg`, `employer-letter.svg`, `travel-ticket.svg`
2. Map slot types in config to `sampleUrl` in mock cases / slot builder helper `lib/slot-instructions.ts`.
3. Optional: copy `Resources/.../Skilled worker documents.png` to `public/samples/README.md` explaining these are reference screenshots for staff.

**VERIFY:**

- [ ] Every **client-upload** slot type in Dino + Sophy has a non-broken `sampleUrl` in UI data.
- [ ] Images load at `http://localhost:3000/samples/...`.

---

### Prompt 1.3 — Shared components (shells + primitives)

**Before you start:** Prompt **1.2** VERIFY passed.

**Task:** Build reusable components per [`SCREEN-INVENTORY.md`](SCREEN-INVENTORY.md):

| Component | Behaviour |
|-----------|-----------|
| `AppShellStaff` | Top nav: Logo, Cases, New case, Demo badge, Log out |
| `AppShellClient` | Logo, applicant name, `ProgressRing` (N of M) |
| `RouteBadge` | SW blue / ILR purple |
| `InstructionPanel` | Renders markdown from general or slot instructions |
| `DontList` | Red/amber bullet list |
| `SampleThumb` | Thumbnail + opens Dialog lightbox |
| `UploadDropzone` | Drag/drop + file picker; shows 7MB hint (validate client-side) |
| `CopyLinkButton` | Clipboard + toast |
| `SlotCard` | Number, title, status icon, link to slot detail |
| `SlotTable` | Staff table: #, name, first name, source, client upload? |
| `StatusChip` | Draft / Live / In progress / Submitted / Zip ready |

Use lucide-react icons. Mobile-friendly tap targets on client components.

**VERIFY:**

- [ ] Storybook optional; at minimum one `/staff/dev/components` page **or** document components in code without runtime errors.
- [ ] `npm run build` passes.

---

### Prompt 1.4 — Staff auth + cases list + demo switcher

**Before you start:** Prompt **1.3** VERIFY passed.

**Task:**

1. **`/staff/login`** — any password or fixed `demo` → set `sessionStorage.staffAuth = '1'` → redirect `/staff/cases`.
2. Middleware or layout guard: staff routes require session (client-side OK for demo).
3. **`/staff/cases`** — table/cards: Dino + Sophy from mock store; columns: name, UAN, route badge, status chip, progress `x/y`, updated.
4. **Demo toolbar** (staff shell): dropdown **Switch case focus** (Dino / Sophy) for quick founder navigation; badge **Demo mode**.
5. Row click → `/staff/cases/[id]` or review if draft.

Seed initial cases from `case-dino.json` / `case-sophy.json` on first load if store empty.

**VERIFY:**

- [ ] Unauthenticated `/staff/cases` redirects to login.
- [ ] Both sample cases visible with correct UANs.
- [ ] [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) step “Open staff cases → Dino” works.

---

### Prompt 1.5 — New case + mock PDF parse flow

**Before you start:** Prompt **1.4** VERIFY passed.

**Task:**

1. **`/staff/cases/new`** — `UploadDropzone` **PDF only**, max 15MB.
2. On file select: show 1.5s loading “Reading checklist…” then navigate to **`/staff/cases/[id]/review`**.
3. Mock parser `lib/mock-parse.ts`: if filename contains `Sophy` or `BIJUMON` → ILR fields; if `Dino` or `Dominic` → SW; else default Dino.
4. Prefill: UAN, applicant name, title, submitted date, product line, suggested route.
5. Create new case id in mock store or reuse demo ids for repeatable demos.

**VERIFY:**

- [ ] Uploading `Skilled worker checklist.pdf` (from Resources) routes to review with Dino UAN.
- [ ] Uploading Sophy checklist PDF routes to ILR review with Sophy UAN.
- [ ] Non-PDF rejected with message.

---

### Prompt 1.6 — Case review + dependant toggle + publish

**Before you start:** Prompt **1.5** VERIFY passed.

**Task:**

1. **`/staff/cases/[id]/review`** — two columns on lg: **Case facts** | **Document pack** (`SlotTable`).
2. Editable: UAN, title, full name, applicant first name, submitted date, route radio (Skilled Worker | ILR) — switching route reloads slot template from JSON.
3. **Skilled Worker only:** `dependantPack` toggle — show/hide partner slots (4, 6, 8×2, 9 per [`SLOT-TEMPLATES.md`](SLOT-TEMPLATES.md)); partner first/full name fields.
4. Cover letter rows: badge **Generated — adviser** (not client upload).
5. **Publish** → `PublishDialog` → generates token `demo-dino-{id}` / stores `clientToken`, status `live` → `CopyLinkButton` with URL `/c/{token}`.
6. **Add slot** button → toast “Coming in Phase 2” (stub).
7. Save draft without publish.

**VERIFY:**

- [ ] Publish copies link; opening link in new tab loads client hub (may 404 until Prompt 1.7 — complete 1.7 before final check).
- [ ] Dependant toggle changes slot count on SW case.
- [ ] Slot numbers match `1 Passport Dino`, `7 Sharecode Dino` labels in table.

---

### Prompt 1.7 — Client hub + slot detail + uploads + finish

**Before you start:** Prompt **1.6** VERIFY passed; publish link exists.

**Task:**

1. **`/c/[token]`** — invalid token → friendly 404 + firm contact.
2. Hub: `InstructionPanel` (general.md), accordion **Before you start**, list of `SlotCard` (skip client upload false for cover letter — show as grey “Prepared by your adviser”).
3. **`/c/[token]/slot/[slotId]`** — instructions, `DontList`, `SampleThumb`, `UploadDropzone`; on select file → update mock store + localStorage; show **Saved ✓** and filename; **7MB** enforce.
4. Share Code + e-Visa slots: extra `Alert` with immigration-matter / dates visible copy from [`CLIENT-INSTRUCTIONS.md`](CLIENT-INSTRUCTIONS.md).
5. HO Consent slot: show consent paragraph + button “Download blank form” → `public/templates/` placeholder PDF or `#` with toast if file not yet added.
6. **`/c/[token]/finish`** — summary all slots; disabled until all required uploads done; checkbox line about HO + firm requirements; submit → status `submitted`, lock client uploads.
7. **`/c/[token]/done`** — thank you.
8. Sticky **Finish** on hub when all complete; progress in shell.

**VERIFY:**

- [ ] [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) Beat 3: mobile width 375px usable.
- [ ] Refresh browser — uploads persist (localStorage).
- [ ] Finish locked until all slots filled; after finish, hub read-only.

---

### Prompt 1.8 — Staff case detail + zip manifest + demo shortcuts

**Before you start:** Prompt **1.7** VERIFY passed.

**Task:**

1. **`/staff/cases/[id]`** — header UAN, route, status; read-only `SlotTable` with per-slot upload status from mock store (synced with client).
2. **Download zip** → `ZipDownloadCard` opens Dialog listing:

```text
Dominic_Dino_1212-0001-6479-0157_Documents/
  Documents/
    (every targetFileName + extension)
  Misc/
    Skilled worker checklist.pdf
```

   No real zip required — **manifest preview** + button “Download zip” triggers mock blob or `.txt` manifest download.

3. **Demo shortcuts** (staff only):
   - **Simulate client completed** — fills all slots with placeholder filenames.
   - **Reset demo case** — clears uploads for this case id.
4. **Preview as client** — opens `/c/{token}`.

**VERIFY:**

- [ ] [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) Beat 4 end-to-end: simulate complete → staff sees submitted → manifest shows numbered filenames.
- [ ] Dino manifest has 9 client files + cover letter line item noted as generated.

---

### Prompt 1.9 — ILR path polish + founder demo hardening

**Before you start:** Prompt **1.8** VERIFY passed for **Dino**; repeat quick pass for **Sophy**.

**Task:**

1. Ensure Sophy case: 8 uploads, cover #9, absence + payslip slots have ILR-specific instruction snippets.
2. Demo switcher jumps to Sophy review + client link `demo-sophy-*`.
3. Add `frontend/DEMO.md` — step list mirroring [`DEMO-SCRIPT.md`](DEMO-SCRIPT.md) with localhost URLs.
4. Fix any dead links; ensure `npm run build` clean.
5. Optional: deploy Vercel — document env none required for demo.

**VERIFY (founder-ready):**

- [ ] Full demo **under 6 minutes** per DEMO-SCRIPT (Dino then Sophy).
- [ ] Share Code instruction visible on **both** routes where applicable.
- [ ] Switching Dino ↔ Sophy changes slot count/labels visibly.
- [ ] `npm run build` && `npm run lint` pass.

**Phase 1 complete.** Do not start Phase 2 until all above checked.

---

# PHASE 2 — Functional MVP (API + persistence)

*Target: [`phases/PHASE-2-functional-mvp.md`](phases/PHASE-2-functional-mvp.md).*

---

### Prompt 2.0 — Verification gate + API layer plan

**Before you start:** Phase **1.9** VERIFY fully passed. `frontend/` exists with all routes.

**Task:**

1. Confirm Phase 1 features still work on `main` branch.
2. Add `lib/api-client.ts` and React Query provider in root layout.
3. Introduce `MockCaseRepository` interface; keep mock implementation for tests.
4. Document env: `DATABASE_URL`, `STORAGE_PATH`, `STAFF_PASSWORD_HASH` in `frontend/.env.example`.

**VERIFY:**

- [ ] Phase 1 manual smoke test still passes before backend changes.

---

### Prompt 2.1 — SQLite schema + API routes (cases, auth, publish)

**Before you start:** Prompt **2.0** passed.

**Task:** Implement [`PRODUCT-SPEC.md`](PRODUCT-SPEC.md) §10 data model + Phase 2 endpoint table:

- `POST /api/auth/login`, session cookie
- `GET /api/cases`, `POST /api/cases` (multipart PDF), `GET/PATCH /api/cases/[id]`, `POST /api/cases/[id]/publish`
- Server-side PDF text extract (pypdf via child process or pdf-parse) — fields per §4

Replace staff list/new/review data fetches with API. Keep demo mode flag optional.

**VERIFY:**

- [ ] Create case from real Resources PDF; UAN appears on review.
- [ ] Publish returns real token; client hub loads from API not only localStorage.

---

### Prompt 2.2 — Client upload API + finish + staff zip download

**Before you start:** Prompt **2.1** passed.

**Task:**

- `GET /api/client/[token]`
- `POST /api/client/[token]/slots/[id]/upload` — disk storage, 7MB, mime check
- `POST /api/client/[token]/submit`
- `GET /api/cases/[id]/zip` — real zip with Documents/ + Misc/

Wire client UI to API; remove localStorage as primary (keep offline message if API fails).

**VERIFY:**

- [ ] Cross-browser: client link on phone uploads persist after refresh.
- [ ] Zip contains renamed files matching `targetFileName`.
- [ ] Client locked after submit.

---

### Prompt 2.3 — Validation UX + error states

**Before you start:** Prompt **2.2** passed.

**Task:** Per [`SCREEN-INVENTORY.md`](SCREEN-INVENTORY.md) validation table: 413/401 pages, upload progress bar, replace file confirm, parse low-confidence banner on review.

**VERIFY:**

- [ ] 8MB file rejected client-side and server-side.
- [ ] Invalid token shows 404 client page.

**Phase 2 complete.**

---

# PHASE 3 — Complete firm UI

*Target: [`phases/PHASE-3-complete-ui.md`](phases/PHASE-3-complete-ui.md).*

---

### Prompt 3.0 — Verification gate

**Before you start:** Phase **2.3** passed. Pilot upload works on one SW + one ILR case.

---

### Prompt 3.1 — Full samples + HO consent PDF + instruction config

**Before you start:** Prompt **3.0** passed.

**Task:** Replace placeholders with real/redacted samples; add `public/templates/home-office-consent-blank.pdf`; wire every slot type to `SampleThumb`; markdown render for all `by-slot-type` files.

**VERIFY:**

- [ ] Every default slot on Dino + Sophy has working sample lightbox.

---

### Prompt 3.2 — Internal guidance drawer + add slot modal + ILR hints

**Before you start:** Prompt **3.1** passed.

**Task:** Staff-only drawer with [`CLIENT-INSTRUCTIONS.md`](CLIENT-INSTRUCTIONS.md) §6.4; functional add slot; ILR “previous passports” suggestion button when parse text includes it.

**VERIFY:**

- [ ] Added slot appears on client hub after re-publish or live update per your API design.

---

### Prompt 3.3 — Cover letter tab + zip manifest modal + dashboard filters

**Before you start:** Prompt **3.2** passed.

**Task:** Case detail Tabs: Documents | Cover letter (fields per route, preview/download); pre-download manifest modal; cases list filters.

**VERIFY:**

- [ ] SW cover letter preview shows UAN + Dino name; ILR tab shows extended fields.

**Phase 3 complete.**

---

# PHASE 4 — Final product UI

*Target: [`phases/PHASE-4-final-product.md`](phases/PHASE-4-final-product.md).*

---

### Prompt 4.0 — Verification gate

**Before you start:** Phase **3.3** passed.

---

### Prompt 4.1 — Branding + custom domain docs + print instructions

**Task:** Firm logo upload config, favicon, footer, export client instructions PDF.

**VERIFY:** Lighthouse mobile ≥ 90 on client hub.

---

### Prompt 4.2 — Reopen case + reject slot UI (client amber state)

**Task:** Staff reject upload with message; client sees warning on slot; reopen case flow.

---

### Prompt 4.3 — OneDrive export button (feature flag)

**Task:** `features.oneDriveExport` false by default; UI stub or Graph integration when backend ready.

**Phase 4+ ongoing.**

---

## Quick reference — sample data the founder must see

| Item | Value |
|------|--------|
| SW case | Mr Dino Dominic, UAN 1212-0001-6479-0157, partner Aparna |
| ILR case | Mrs Sophy Bijumon, UAN 1212-0001-6466-5462 |
| Share code rule | “To prove an immigration matter” |
| SW client uploads | 9 (excl. cover #3) |
| ILR client uploads | 8 (excl. cover #9) |
| Max file size | 7 MB (client) |

---

## Chaining cheat sheet

```text
1.0 → 1.1 → 1.2 → 1.3 → 1.4 → 1.5 → 1.6 → 1.7 → 1.8 → 1.9  (founder demo DONE)
2.0 → 2.1 → 2.2 → 2.3                                          (real product)
3.0 → 3.1 → 3.2 → 3.3                                          (firm-complete UI)
4.0 → 4.1 → 4.2 → 4.3                                          (scale)
```

When a prompt fails VERIFY, fix in place before running the next prompt.
