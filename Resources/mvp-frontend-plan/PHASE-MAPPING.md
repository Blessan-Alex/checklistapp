# Phase mapping — plan.md §12 ↔ mvp-frontend-plan

## plan.md Phase 1 — Core loop

| # | plan.md item | Frontend phase | Where in FE plan |
|---|--------------|----------------|------------------|
| 1 | Staff login + upload checklist + parsed UAN/name | P2 | `PHASE-2` API + new case UI |
| 2 | ILR + SW slot templates §7 | P1 + P2 | `SLOT-TEMPLATES.md`, JSON config, P1 mock |
| 3 | General + per-slot instructions §6 (min set) | P1 + P2 | `CLIENT-INSTRUCTIONS.md`, P1 hub + slots |
| 4 | Staff review + publish link | P1 + P2 | Review screen, copy link |
| 5 | Client upload + save progress | P2 | Client hub, localStorage optional in P1 |
| 6 | Finish → zip + checklist in Misc | P2 | Zip download + manifest modal (P3 polish) |

**P1** delivers the same **screens** with mock data so founders see the loop before P2 ships.

## plan.md Phase 2 — Polish

| # | plan.md item | Frontend phase |
|---|--------------|----------------|
| 1 | Sample files every slot; HO consent PDF download | P3 |
| 2 | Better checklist line → slot suggestions | P3 (review UI hints) |
| 3 | Dependant toggle SW | P1 mock optional; P3 full |
| 4 | Cover letter auto-generation §8 | P3 UI preview + P2 backend may stub |
| 5 | Staff internal guidance §6.4 | P3 drawer |
| 6 | Simple case status dashboard | P3 filters; P2 basic list |

## plan.md Phase 3 — Later

| Item | Frontend phase |
|------|----------------|
| OneDrive / Graph | P4 |
| More routes | P4 |
| Email notifications | P4 |
| Supervisor / compliance / audit | Out of scope (per plan) |
