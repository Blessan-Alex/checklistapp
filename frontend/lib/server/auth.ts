import { createHmac, timingSafeEqual } from "node:crypto";
import { compare } from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionSecret, getStaffPasswordHash } from "@/lib/server/env";

export const STAFF_SESSION_COOKIE = "staff_session";

function signStaffSession(): string {
  return createHmac("sha256", getSessionSecret())
    .update("staff-authenticated")
    .digest("hex");
}

export function createStaffSessionCookieValue(): string {
  return signStaffSession();
}

export function verifyStaffSessionCookie(value: string | undefined): boolean {
  if (!value) {
    return false;
  }
  const expected = signStaffSession();
  try {
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export async function validateStaffPassword(password: string): Promise<boolean> {
  const hash = getStaffPasswordHash();
  if (!hash || !password) {
    return false;
  }
  return compare(password, hash);
}

export async function getStaffSessionFromCookies(): Promise<boolean> {
  const jar = await cookies();
  return verifyStaffSessionCookie(jar.get(STAFF_SESSION_COOKIE)?.value);
}

export function attachStaffSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(STAFF_SESSION_COOKIE, createStaffSessionCookieValue(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

export function clearStaffSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(STAFF_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function requireStaffApiAuth(): Promise<NextResponse | null> {
  const ok = await getStaffSessionFromCookies();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
