import { NextResponse } from "next/server";
import {
  ClientCaseError,
  confirmClientSlotUploadAfterStorage,
} from "@/lib/server/client-case-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string; slotId: string }> },
) {
  const { token, slotId } = await context.params;
  const body = (await request.json()) as {
    originalName?: string;
    uploadedAt?: string;
  };

  const originalName = body.originalName?.trim();
  if (!originalName) {
    return NextResponse.json({ error: "Invalid upload metadata" }, { status: 400 });
  }

  try {
    const caseRecord = await confirmClientSlotUploadAfterStorage(
      token,
      slotId,
      originalName,
      body.uploadedAt,
    );
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    if (error instanceof ClientCaseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}
