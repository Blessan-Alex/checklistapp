# Firebase (Spark free) + Vercel — production setup

Use this when the app should be **shared across staff and clients** (not browser-only mock data).

## Why this stack

| Piece | Choice | Reason |
|-------|--------|--------|
| **Host** | Vercel Hobby (free) | Native Next.js 16, previews per PR |
| **Database** | Firestore | Matches your JSON `Case` documents; free Spark quotas |
| **Files** | **Vercel Blob** (private) | Checklist PDFs + client uploads; no Firebase Storage / Blaze required |
| **Auth** | Existing staff cookie + `STAFF_PASSWORD_HASH` | No Firebase Auth required for MVP |

This repo uses **Firestore for case JSON** and **Vercel Blob for files** when Firebase env vars are set on Vercel.

---

## 1. Firebase project (Spark)

**This repo is configured for project `checklistapp-ab71c`**.

1. [Firebase Console](https://console.firebase.google.com/) → project **checklistapp-ab71c** (or create one).
2. **Build → Firestore** → Create database → **Production mode** (rules locked down below).
3. **Project settings → Service accounts** → **Generate new private key** (JSON).

You do **not** need Firebase Storage (or Blaze billing) for this app — files go to **Vercel Blob** (see §4).

From the JSON file, copy:

- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (paste as one line with `\n` for newlines in Vercel)

---

## 2. Firestore index

The app queries cases by `clientToken`. On first publish, Firestore may prompt you to create an index from the error link. Or add in Firebase Console:

- Collection: `portal_cases`
- Field: `clientToken` — Ascending

---

## 3. Security rules (important)

Clients must **not** talk to Firestore directly. Only the Next.js API uses the Admin SDK.

**Firestore** (`firestore.rules`):

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Publish Firestore rules in the Firebase Console. All data access goes through your Vercel API routes. Blob files are private and only read/written by the server (`BLOB_READ_WRITE_TOKEN`).

---

## 4. Vercel environment variables

**Production** (and Preview if you want real data on previews):

| Variable | Example / notes |
|----------|-----------------|
| `NEXT_PUBLIC_USE_MOCK_STORE` | `false` |
| `DATA_BACKEND` | `firebase` (optional if Firebase vars are set) |
| `FIREBASE_PROJECT_ID` | from service account |
| `FIREBASE_CLIENT_EMAIL` | from service account |
| `FIREBASE_PRIVATE_KEY` | from service account (escaped newlines) |
| `BLOB_READ_WRITE_TOKEN` | Auto-set when you connect a **Blob** store in Vercel → Storage (use a **private** store) |
| `SESSION_SECRET` | long random string |
| `STAFF_PASSWORD_HASH` | `bcrypt` hash of staff password |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

Generate password hash locally:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

**Do not** set `DATABASE_URL`, `STORAGE_PATH`, or `FIREBASE_STORAGE_BUCKET` on Vercel for production.

### Vercel Blob (files)

1. Vercel project → **Storage** → **Create** → **Blob** → name e.g. `checklist-files` → **Private**.
2. Connect the store to this project. Vercel adds `BLOB_READ_WRITE_TOKEN`.
3. Redeploy after connecting.

Hobby includes a small free Blob allowance (see [Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)).

---

## 5. GitHub → Vercel

1. Push repo; import in Vercel.
2. **Root Directory:** `frontend`
3. Deploy.

Optional: set `DEMO_SEED_CASES=true` to seed **Dino** and **Sophy** when the Firestore collection is empty (off by default in production).

---

## 6. Smoke test (production)

1. `/staff/login` with your bcrypt password.
2. Cases list loads from Firestore.
3. Open Dino → Publish → copy client link.
4. Client upload (keep files **≤ 4 MB** on Vercel).
5. Finish → staff **Download zip**.

---

## 7. Demo-only deploy (no Firebase)

Keep `NEXT_PUBLIC_USE_MOCK_STORE=true` and omit Firebase vars. Data stays in each user’s browser — fine for a pitch URL only.

See also [DEPLOYMENT.md](./DEPLOYMENT.md).
