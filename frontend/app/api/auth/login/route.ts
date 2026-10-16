import { NextResponse } from "next/server";
import {
  attachStaffSessionCookie,
  validateStaffPassword,
} from "@/lib/server/auth";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  if (!(await validateStaffPassword(password))) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  return attachStaffSessionCookie(response);
}
