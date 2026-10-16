import { NextResponse } from "next/server";
import { clearStaffSessionCookie } from "@/lib/server/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  return clearStaffSessionCookie(response);
}
