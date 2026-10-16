import { NextResponse } from "next/server";
import { MAX_STAFF_CHECKLIST_BYTES } from "@/lib/constants";
import { getServerCaseRepository } from "@/lib/server/case-repository-server";
import { requireStaffApiAuth } from "@/lib/server/auth";
import { getCaseBlobStorage } from "@/lib/server/case-blob-storage";
import { parseChecklistPdf } from "@/lib/server/pdf-extract";

export async function GET() {
  const authError = await requireStaffApiAuth();
  if (authError) {
    return authError;
  }
  const repo = getServerCaseRepository();
  const cases = await repo.listCases();
  return NextResponse.json({ cases });
}

export async function POST(request: Request) {
  const authError = await requireStaffApiAuth();
  if (authError) {
    return authError;
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "PDF only" }, { status: 400 });
  }
  if (file.size > MAX_STAFF_CHECKLIST_BYTES) {
    return NextResponse.json({ error: "File too large" }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await parseChecklistPdf(buffer, file.name);
  const updatedAtIso = new Date().toISOString();
  const repo = getServerCaseRepository();
  const caseRecord = await repo.upsertFromParsedChecklist(
    file.name,
    parsed,
    updatedAtIso,
  );
  await getCaseBlobStorage().writeChecklistPdf(
    caseRecord.id,
    file.name,
    buffer,
  );

  return NextResponse.json({
    case: caseRecord,
    parseConfidence: parsed.parseConfidence,
  });
}
