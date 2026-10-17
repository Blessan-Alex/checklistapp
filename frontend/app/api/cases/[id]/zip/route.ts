import { NextResponse } from "next/server";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { requireStaffApiAuth } from "@/lib/server/auth";
import { buildCaseZipBuffer } from "@/lib/server/build-case-zip";
import { getArchiveRootName } from "@/lib/zip-manifest";

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

  if (
    caseRecord.status !== "ready_to_zip" &&
    caseRecord.status !== "zip_ready"
  ) {
    return NextResponse.json(
      { error: "Approve all documents and finish review before downloading the zip." },
      { status: 400 },
    );
  }

  const zipBuffer = await buildCaseZipBuffer(caseRecord);

  if (caseRecord.status === "ready_to_zip") {
    await repo.saveCase({
      ...caseRecord,
      status: "zip_ready",
      updatedAt: new Date().toISOString(),
    });
  }

  const root = getArchiveRootName(caseRecord);
  const filename = `${root}.zip`;

  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
