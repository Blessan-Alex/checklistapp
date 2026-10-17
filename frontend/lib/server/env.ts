import { join } from "node:path";

function requireEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDatabasePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./data/portal.db";
  const raw = url.startsWith("file:") ? url.slice("file:".length) : url;
  if (raw.startsWith("/") || /^[A-Za-z]:/.test(raw)) {
    return raw;
  }
  const relative = raw.replace(/^\.\//, "");
  if (relative.startsWith("data/")) {
    return join(process.cwd(), "data", relative.slice("data/".length));
  }
  return join(process.cwd(), "data", "portal.db");
}

export function getStoragePath(): string {
  const raw = process.env.STORAGE_PATH ?? "./storage";
  if (raw.startsWith("/") || /^[A-Za-z]:/.test(raw)) {
    return raw;
  }
  if (raw === "./storage" || raw === "storage") {
    return join(process.cwd(), "storage");
  }
  return join(process.cwd(), "storage");
}

export function getStaffPasswordHash(): string | undefined {
  const hash = process.env.STAFF_PASSWORD_HASH?.trim();
  return hash || undefined;
}

export function getSessionSecret(): string {
  if (process.env.NODE_ENV === "production") {
    return requireEnv("SESSION_SECRET");
  }
  return requireEnv("SESSION_SECRET", "dev-session-secret-change-me");
}
