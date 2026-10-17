import { NextResponse } from "next/server";
import { getStaffSessionFromCookies } from "@/lib/server/auth";

export async function GET() {
  const ok = await getStaffSessionFromCookies();
  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
