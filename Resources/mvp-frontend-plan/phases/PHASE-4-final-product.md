# Phase 4 — Final product frontend

**Duration:** ongoing  
**Goal:** North-star UI complete for firm scale: brand, reliability, optional integrations, more routes.

This phase implements the remainder of [`../NORTH-STAR-UI.md`](../NORTH-STAR-UI.md) and **plan.md §12 Phase 3 (later):** OneDrive, more routes, email — not supervisor/audit (out of scope per plan).

## Brand & trust

- [ ] Firm logo, colours, favicon, email domain on client pages.
- [ ] Custom domain (`documents.yourfirm.co.uk`).
- [ ] Legal footer (privacy link — light touch even if full GDPR program deferred).
- [ ] Print-friendly client instruction summary (PDF export).

## Staff experience at scale

- [ ] Case **search** by UAN, name.
- [ ] **Bulk** status view for team (multiple caseworkers — if multi-login added).
- [ ] **Reopen case** for client (new uploads after submit) with audit note in UI.
- [ ] **Reject / request replacement** on a slot → client sees amber state + message.
- [ ] Keyboard shortcuts on case review (save, publish).

## Client experience

- [ ] Optional **PIN** on link (second factor for sensitive cases).
- [ ] **Email magic link** resend (if notification service added).
- [ ] WCAG **AA** audit fixes: focus order, aria-live on save.
- [ ] Optional **Welsh / other language** for instructions (i18n strings).

## Integrations (UI surfaces)

- [ ] **OneDrive / SharePoint:** “Send to firm folder” button post-zip; picker or fixed path template.
- [ ] **Email:** template preview when sending link to client from staff UI.
- [ ] Webhook status for practice management tool (future).

## More routes (frontend pattern)

- [ ] New route = new `*.slots.json` + cover template — no new page types.
- [ ] Route picker on review when product/service ambiguous.
- [ ] Family, student, naturalisation packs (content project + config).

## Observability (light)

- [ ] Admin page: upload errors, avg time-to-complete (no heavy analytics suite).
- [ ] Client-side error boundary with “copy debug id”.

## Performance

- [ ] Image compression hint before upload (client-side downscale optional).
- [ ] Lazy-load sample images; CDN for static assets.

## Acceptance criteria (final frontend)

- [ ] All screens in [`../SCREEN-INVENTORY.md`](../SCREEN-INVENTORY.md) at “P4 Final” column done.
- [ ] Firm signs off on copy, samples, and zip manifest UX.
- [ ] OneDrive path (if built) tested on 10 production cases without manual rename.

## Relationship to backend Phase 3

Frontend Phase 4 can ship **incrementally** (brand first, OneDrive when API ready). Keep feature flags in UI:

```ts
features.oneDriveExport
features.multiRoute
features.clientPin
```
