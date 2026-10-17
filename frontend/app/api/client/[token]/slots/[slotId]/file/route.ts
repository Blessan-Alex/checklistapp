import { NextResponse } from "next/server";
import {
  ClientCaseError,
  getClientCaseForPortal,
} from "@/lib/server/client-case-service";
import {
  CaseSlotFileError,
  clientMayViewSlotUpload,
  readCaseSlotUploadBytes,
} from "@/lib/server/case-slot-file";

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string; slotId: string }> },
) {
  const { token, slotId } = await context.params;

  try {
    const caseRecord = await getClientCaseForPortal(token);
    const slot = caseRecord.slots.find((s) => s.id === slotId);
    if (!slot) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    if (!clientMayViewSlotUpload(caseRecord, slot)) {
      return NextResponse.json({ error: "Not available" }, { status: 403 });
    }

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
    if (error instanceof ClientCaseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
