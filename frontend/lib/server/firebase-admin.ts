import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let firestoreDb: Firestore | null = null;

function requireFirebaseEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name} for Firebase backend`);
  }
  return value;
}

export function getFirebaseApp(): App {
  const existing = getApps()[0];
  if (existing) {
    return existing;
  }

  const projectId = requireFirebaseEnv("FIREBASE_PROJECT_ID");
  const clientEmail = requireFirebaseEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = requireFirebaseEnv("FIREBASE_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreDb) {
    firestoreDb = getFirestore(getFirebaseApp());
    firestoreDb.settings({ ignoreUndefinedProperties: true });
  }
  return firestoreDb;
}
