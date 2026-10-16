# Client & staff instructions (plan.md §6)

UI must render this content (markdown). Config: `config/instructions/` + per-slot fields on `*-slots.json`.

## §6.1 Client UI pattern

1. **General instructions** — top of upload hub (“Before you start”).
2. **Per slot** — instructions, **don’ts**, **sample** (lightbox), optional **download** (blank consent).

Pattern: slot row → expand Instructions → **See example**.

---

## §6.2 General instructions (verbatim — every client link)

Please provide all the documents listed for your application.

When sending your documents, please ensure that:

- The images are **clear and glare-free**.
- **All four edges** of each document are visible.
- The documents are placed on a **plain background**.
- All text, photos, and other details are **clearly visible and readable**.
- The images are not blurred, cropped, or covered.

**Additional documents required (not always on the Home Office checklist):**

1. **eVisa** — A screenshot is sufficient. Ensure the **visa start date** and **visa expiry date** are clearly visible.
2. **Share Code** — Generate the share code by selecting **“To prove an immigration matter”** (not “right to rent” or “right to work”). In GOV.UK wording this is the option to **prove immigration status** for something else.
3. **BRP** (if applicable)

If you have any questions, please let us know. Thank you.

**Passport slots — repeat:** four corners visible, no shadow, no glare, every word readable.

**Finish screen (optional):**  
Make sure all documents meet the requirements of this list **and** the Home Office checklist provided to you.

---

## §6.3 Per-slot config fields

| Field | Purpose |
|--------|---------|
| `instructions` | What to upload / how to obtain |
| `donts` | Common mistakes |
| `sampleFile` | `Resources/samples/` or `public/samples/` |
| `attachmentForClient` | e.g. blank HO consent PDF |

### Slot-type copy (MVP minimum)

| Slot type | Client must know |
|-----------|------------------|
| **Share Code** | **“To prove an immigration matter”** / prove immigration status — **not** right to rent or right to work. **≥ 1 month** validity; prefer new code. If cannot generate valid code → staff decides if slot waived. |
| **e-Visa** | Screenshot OK; **start and end dates** visible. Missing dates = does not prove leave (warn in UI). |
| **BRP** | If applicable; same quality as passport. |
| **HO consent (SW)** | *Please complete and sign the **first page** of the attached document. Kindly ensure that all required fields are completed, including your **full name, address, postcode, date, and signature**. Once completed, upload the signed document here with your other documents.* + download blank PDF. |
| **Passport** | Four edges, plain background, no glare; every word readable. |
| **CoS (pending)** | Employer letter confirming CoS issuance may be needed — see staff §6.4. |

**ILR extras (per slot bullets):**

- Absence employer letter + travel ticket — dates and purpose clear.
- Payslip + bank — HO rule: dated no earlier than one calendar month before application; statement shows payment on payslip.

---

## §6.4 Staff-only guidance (review / case detail — not default client UI)

Collapsible **Internal guidance** on staff review. Used when adding slots; optional “show extra guidance” to client only if staff enables.

- **Pending CoS:** Employer letter confirming CoS issuance if CoS unavailable.
- **Prove relationship:** Chats, calls, emails, photos — **dated**, as old as possible; continuity.
- **Living together:** Two doc types over **2 years** (tenancy + council tax); else max available (bank, utilities, bills).
- **First-time 6135/36 (switch):** Bank statements + payslips **3 months before CoS issue date** (check CoS).
- **SW maintenance:** Maintenance ticked on CoS for all (incl. dependants). If not ticked: all in UK **> 1 year** else bank statements for funds.
- **NMC:** NMC certificate for doctors/nurses etc.
- **ILR / naturalisation:** English language (if required) + **Life in the UK** certificate.
- **Outside UK:** TB where required; PCC for health/care/education (main or dependant).
- **e-Visa / Share Code:** Same as §6.3; all passports/scans meet quality bar.

---

## §6.5 Implementation ↔ frontend phases

| plan.md note | Frontend phase |
|--------------|----------------|
| Samples in `Resources/samples/` | P3 all slots; P1 placeholders OK |
| HO consent blank PDF on slot | P3 download button |
| Instructions in UI not email | P1+ all phases |
| General + Share Code, e-Visa, passport, consent text | **P1** minimum |
| Samples all slots + staff panel | **P3** |

Do not rely on clients reading email — copy lives **beside upload**.
