import { NextResponse } from "next/server";
import {
  CaseStaffActionError,
  rejectClientSlotUpload,
} from "@/lib/server/case-staff-actions";
import { requireStaffApiAuth } from "@/lib/server/auth";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string; slotId: string }> },
) {
  const authError = await requireStaffApiAuth();
  if (authError) {
    return authError;
  }

  const { id, slotId } = await context.params;
  const body = (await request.json()) as { message?: string };

  try {
    const caseRecord = await rejectClientSlotUpload(
      id,
      slotId,
      body.message ?? "",
    );
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    if (error instanceof CaseStaffActionError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
