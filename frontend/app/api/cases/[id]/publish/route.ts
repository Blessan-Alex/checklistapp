import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { ROUTES } from "@/config/routes";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { requireStaffApiAuth } from "@/lib/server/auth";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireStaffApiAuth();
  if (authError) {
    return authError;
  }
  const { id } = await context.params;
  const repo = getServerCaseRepository();
  const existing = await repo.getCaseById(id);
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (
    existing.status === "submitted" ||
    existing.status === "ready_to_zip" ||
    existing.status === "zip_ready"
  ) {
    return NextResponse.json(
      { error: "Case is submitted. Reopen the case before publishing again." },
      { status: 409 },
    );
  }
  if (existing.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft cases can be published. Save as draft first." },
      { status: 409 },
    );
  }

  const published = await repo.publishCase(id, randomUUID());
  if (!published?.clientToken) {
    return NextResponse.json({ error: "Publish failed" }, { status: 500 });
  }

  const origin =
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return NextResponse.json({
    case: published,
    clientUrl: `${origin}${ROUTES.clientPortal(published.clientToken)}`,
  });
}
