import { NextResponse } from "next/server";
import {
  CaseStaffActionError,
  reopenCaseForClient,
} from "@/lib/server/case-staff-actions";
import { requireStaffApiAuth } from "@/lib/server/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const authError = await requireStaffApiAuth();
  if (authError) {
    return authError;
  }

  const { id } = await context.params;
  const body = (await request.json()) as { note?: string };

  try {
    const caseRecord = await reopenCaseForClient(id, body.note ?? "");
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    if (error instanceof CaseStaffActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
