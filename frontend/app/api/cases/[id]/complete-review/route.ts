import { NextResponse } from "next/server";
import {
  CaseStaffActionError,
  completeStaffPackReview,
} from "@/lib/server/case-staff-actions";
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

  try {
    const caseRecord = await completeStaffPackReview(id);
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    if (error instanceof CaseStaffActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
