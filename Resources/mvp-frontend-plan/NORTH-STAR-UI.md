# North-star UI — final product frontend

This is the **end-of-road** interface: what every screen should become after Phase 4. Phases 1–3 deliberately subset this; use this doc so early UI does not paint into a corner.

## Design principles

1. **Mobile-first client** — large tap targets, camera upload, progress always visible.
2. **Calm staff** — dense tables OK on desktop; clear status chips (Draft / Live / Submitted / Zip ready).
3. **Instructions beside action** — never a separate PDF email for “how to share code”.
4. **Route-aware, config-driven** — ILR vs Skilled Worker = same components, different slot JSON.
5. **Trust** — firm logo, UAN visible, “saved” indicator after each upload.

## Global layout

### Staff shell

```text
┌─────────────────────────────────────────────────────────┐
│ [Logo]  Cases   + New case          [User] Log out      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   Main content (max-w-6xl, padded)                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Client shell

```text
┌─────────────────────────────────────────────────────────┐
│ [Logo]  Documents for {FirstName}     Progress 7/10     │
├─────────────────────────────────────────────────────────┤
│  ▼ Before you start (general instructions)              │
│  ┌─────────────────────────────────────────────────┐  │
│  │ Slot list OR slot detail                         │  │
│  └─────────────────────────────────────────────────┘  │
│                              [ Save & continue later ]  │
│                              [ Finish ] (disabled…)     │
└─────────────────────────────────────────────────────────┘
```

## Staff — final screens

### 1. Login

- Email/username + password; firm branding; no self-signup.

### 2. Cases dashboard

- **Filters:** All | Draft | With client | Submitted | Ready to download.
- **Cards/rows:** Applicant name, UAN, route badge (SW / ILR), progress `client 8/10`, last updated.
- **Actions:** Open, Copy client link (if live), Download zip (if submitted).

### 3. New case — upload checklist

- Drag-drop **PDF only**; show filename + size.
- On upload: **parsing panel** (animated) → prefilled fields:
  - UAN, full name, title, submitted date, product/service, suggested route.
- **Route override:** Skilled Worker | ILR radio if parser unsure.
- CTA: **Continue to review**.

### 4. Case review (critical staff screen)

**Requires staff confirmation before publish** — parsed checklist fields are suggestions only (plan.md §4).

**Left column — case facts**

- Editable: UAN, title, full name, first name (for filenames), submitted date.
- Skilled Worker: **Dependant pack** toggle; partner first name + full name (cover letter).
- ILR: optional flags from checklist (“Previous passports required”).

**Right column — document pack**

- Table: `#` | Document name | First name | Source (HO / Firm / Added) | Client uploads?
- Cover letter row marked **Generated — not client upload**.
- **Add slot** modal: number, name, first name, instructions.
- **Internal guidance** collapsible (senior rules from plan §6.4) — staff only.

**Footer**

- Preview client view (opens `/c/{token}` in new tab).
- **Publish link** → toast + copy URL.
- Save as draft without publishing.

### 5. Case detail (post-publish)

- **Timeline:** Created → Published → Client progress → Submitted → Zip built.
- **Per-slot client status:** empty | uploaded (filename, date) | replace requested (future).
- **Cover letter:** Preview PDF/DOCX, edit fields, regenerate.
- **Download zip** + **Reopen for client** (future).
- Attach original checklist thumbnail/link.

## Client — final screens

### 1. Welcome / hub

- Greeting: “Hi {FirstName}, please upload the documents below.”
- **General instructions** (expandable): photo quality, e-visa dates, share code option, BRP note.
- **Progress bar** and list of slots:
  - Row: number, title, status icon (todo / done), chevron.
- Sticky footer: **Finish** (disabled until all mandatory slots done).

### 2. Slot detail (per document)

- **Title:** `7 Sharecode Dino`
- **What to do** — markdown from firm copy.
- **What not to do** — bullets (e.g. wrong share code type).
- **Example** — image/PDF lightbox (`See good example`).
- **Download** — blank HO consent PDF when slot requires it.
- **Upload zone:** drag-drop, camera on mobile; shows 7 MB limit.
- After upload: file name, **Replace**, **Saved ✓**.
- Soft warning banner on e-visa / share code slots if heuristics fail (Phase 3+).

### 3. Finish — confirmation

- Checklist summary: all slots green.
- Copy: meet firm list + Home Office checklist.
- **Submit** → locks client view → thank you + contact email.

### 4. Thank you / locked

- “We’ve received your documents.”
- No further uploads unless staff reopens case.

## Empty, loading, error states (final)

| State | Client | Staff |
|-------|--------|-------|
| Invalid token | Friendly 404 + contact firm | — |
| Upload too large | Inline “Max 7 MB” | — |
| Network fail | Retry on upload | Retry save |
| Parsing fail | — | Manual entry highlighted, still proceed |

## Visual identity (final)

- Professional, legal-adjacent: navy/slate + one accent (firm green).
- Route badges: SW = blue, ILR = purple.
- Accessibility: WCAG AA contrast, focus rings, screen reader labels on upload buttons.

## Out of scope for “final UI” but reserved

- Supervisor analytics page.
- Client email notifications UI settings.
- OneDrive browser picker.
- Multi-language toggle.

See [`SCREEN-INVENTORY.md`](SCREEN-INVENTORY.md) for route map and component list.
