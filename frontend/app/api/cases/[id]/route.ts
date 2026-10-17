import { NextResponse } from "next/server";
import { rebuildCaseSlots } from "@/lib/case-slots";
import {
  CaseDeleteError,
  deleteCasePermanently,
} from "@/lib/server/delete-case";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { requireStaffApiAuth } from "@/lib/server/auth";
import type { Case } from "@/lib/types";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireStaffApiAuth();
  if (authError) {
    return authError;
  }
  const { id } = await context.params;
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseById(id);
  if (!caseRecord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ case: caseRecord });
}

export async function PATCH(
  request: Request,
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

  const patch = (await request.json()) as Partial<Case>;
  let merged: Case = {
    ...existing,
    ...patch,
    id: existing.id,
    slots: patch.slots ?? existing.slots,
  };

  if (
    patch.route !== undefined ||
    patch.dependantPack !== undefined ||
    patch.applicantFirstName !== undefined ||
    patch.partnerFirstName !== undefined
  ) {
    merged = {
      ...merged,
      slots: rebuildCaseSlots(merged, merged.slots),
    };
  }

  const saved = await repo.saveCase(merged);
  return NextResponse.json({ case: saved });
}

export async function DELETE(
  request: Request,
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

  let body: { confirmName?: string } = {};
  try {
    body = (await request.json()) as { confirmName?: string };
  } catch {
    return NextResponse.json(
      { error: "Confirmation required" },
      { status: 400 },
    );
  }

  const confirmName = body.confirmName?.trim() ?? "";
  if (
    !confirmName ||
    confirmName.toLowerCase() !==
      existing.applicantFullName.trim().toLowerCase()
  ) {
    return NextResponse.json(
      {
        error:
          "Type the applicant’s full name exactly to confirm permanent deletion.",
      },
      { status: 400 },
    );
  }

  try {
    await deleteCasePermanently(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof CaseDeleteError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
