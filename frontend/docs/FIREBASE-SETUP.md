# Firebase (Spark free) + Vercel — production setup

Use this when the app should be **shared across staff and clients** (not browser-only mock data).

## Why this stack

| Piece | Choice | Reason |
|-------|--------|--------|
| **Host** | Vercel Hobby (free) | Native Next.js 16, previews per PR |
| **Database** | Firestore | Matches your JSON `Case` documents; free Spark quotas |
| **Files** | Firebase Storage | Checklist PDFs + client uploads; replaces local `storage/` |
| **Auth** | Existing staff cookie + `STAFF_PASSWORD_HASH` | No Firebase Auth required for MVP |

Alternatives (Turso + Vercel Blob) are fine later; this repo **implements Firestore + Storage** when Firebase env vars are set.

---

## 1. Firebase project (Spark)

**This repo is configured for project `checklistapp-ab71c`** (`checklistapp-ab71c.firebasestorage.app`).

1. [Firebase Console](https://console.firebase.google.com/) → project **checklistapp-ab71c** (or create one).
2. **Build → Firestore** → Create database → **Production mode** (rules locked down below).
3. **Build → Storage** → Get started → default bucket.
4. **Project settings → Service accounts** → **Generate new private key** (JSON).

From the JSON file, copy:

- `project_id` → `FIREBASE_PROJECT_ID`
- `client_email` → `FIREBASE_CLIENT_EMAIL`
- `private_key` → `FIREBASE_PRIVATE_KEY` (paste as one line with `\n` for newlines in Vercel)

Set `FIREBASE_STORAGE_BUCKET` to `your-project-id.appspot.com` (or the bucket shown in Storage).

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

**Storage** (`storage.rules`):

```text
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

Publish rules in the Firebase Console. All access goes through your Vercel API routes.

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
| `FIREBASE_STORAGE_BUCKET` | `project-id.appspot.com` |
| `SESSION_SECRET` | long random string |
| `STAFF_PASSWORD_HASH` | `bcrypt` hash of staff password |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |

Generate password hash locally:

```bash
node -e "console.log(require('bcryptjs').hashSync('your-password', 10))"
```

**Do not** set `DATABASE_URL` or `STORAGE_PATH` on Vercel for Firebase mode.

---

## 5. GitHub → Vercel

1. Push repo; import in Vercel.
2. **Root Directory:** `frontend`
3. Deploy.

First API request seeds **Dino** and **Sophy** in Firestore if the collection is empty.

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
