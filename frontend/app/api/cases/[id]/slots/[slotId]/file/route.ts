import { NextResponse } from "next/server";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { requireStaffApiAuth } from "@/lib/server/auth";
import {
  CaseSlotFileError,
  readCaseSlotUploadBytes,
} from "@/lib/server/case-slot-file";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; slotId: string }> },
) {
  const authError = await requireStaffApiAuth();
  if (authError) {
    return authError;
  }

  const { id, slotId } = await context.params;
  const repo = getServerCaseRepository();
  const caseRecord = await repo.getCaseById(id);
  if (!caseRecord) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { buffer, fileName, contentType } = await readCaseSlotUploadBytes(
      caseRecord,
      slotId,
    );
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof CaseSlotFileError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
