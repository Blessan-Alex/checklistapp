# Slot templates & zip layout (plan.md §7)

Naming rule:

```text
{documentNumber} {documentName} {personFirstName}
```

- Shared numbers allowed (e.g. `7 E Visa` + `7 Sharecode`).
- **personFirstName** when person-specific; omit when sample omits (e.g. `5 Bank statement`).
- **Extensions:** keep client extension or normalize to `.pdf`; cover letter `.docx` (or `.pdf` later).
- **Sanitize** Windows-forbidden characters in generated names.

---

## Skilled Worker — default (Dino dependant)

### Documents/ (client uploads unless noted)

| # | Document name | First name | Notes |
|---|----------------|------------|--------|
| 1 | Passport | Applicant | |
| 2 | Home Office Consent | — | |
| 3 | Cover Letter | — | **Generated** — not client upload |
| 4 | Passport | Partner / dependant | |
| 5 | CoS | Applicant | suffix e.g. `pending`; text file OK |
| 6 | Marriage Certificate | — | |
| 7 | E Visa | Applicant | |
| 7 | Sharecode | Applicant | |
| 8 | E Visa | Partner | |
| 8 | Sharecode | Partner | |
| 9 | BRP | Partner | |
| 10 | BRP | Applicant | |

**Variant:** Applicant-only — staff toggle removes rows 4, 6, 8×2, 9 (partner BRP); adjust per case.

### Misc/ (not all client uploads)

| Item | Source |
|------|--------|
| Submitted checklist PDF | Staff upload at case create |
| Google Form | Optional client slot or staff adds later |
| `11 Cover Letter` | **MVP:** omit — use **#3 only** in Documents/ |
| VAF / portal PDF | Optional slot when applicable |

---

## ILR — default (Sophy)

| # | Document name | First name | Typical HO mapping |
|---|----------------|------------|---------------------|
| 1 | Passport | Applicant | Mandatory passport |
| 2 | Letter from employer confirming reason for absence | — | Absence |
| 2 | Travel ticket proving absence from the UK | — | Absence |
| 3 | E-Visa | Applicant | Status |
| 3 | Sharecode | Applicant | Status |
| 4 | Home office consent form | — | Consent |
| 5 | Bank statement | — | Financial |
| 5 | Payslip | — | Financial |
| 6 | Letter from employer | — | Sponsor |
| 7 | CoS | — | |
| 8 | BRP | Applicant | |
| 9 | Cover Letter | — | **Generated** |

**Rare:** HO “previous passports” → staff adds slot on review.

---

## Zip structure

```text
{ApplicantLastName}_{UAN}_Documents/
  Documents/
    1 Passport Dino.pdf
    2 Home Office Consent.pdf
    ...
  Misc/
    {OriginalChecklistFileName}.pdf
    ...
```

**FE:** Pre-download manifest (P3) lists exact `Documents/` names. Staff UI may show configurable archive root name.

---

## Route comparison (quick)

| | Skilled Worker (Dino) | ILR (Sophy) |
|---|------------------------|-------------|
| HO checklist depth | Minimal (often passport only) | Long “Other documents” |
| People | Often 2 | Usually 1 |
| Cover letter # | 3 | 9 |
| Absence / payslip / bank | Not in default SW sample | Yes |

Full analysis: [`../route-comparison.md`](../route-comparison.md).
