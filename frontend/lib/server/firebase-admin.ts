import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

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
  const storageBucket =
    process.env.FIREBASE_STORAGE_BUCKET?.trim() ||
    `${projectId}.appspot.com`;

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket,
  });
}

export function getFirebaseFirestore() {
  return getFirestore(getFirebaseApp());
}

export function getFirebaseStorageBucket() {
  return getStorage(getFirebaseApp()).bucket();
}
