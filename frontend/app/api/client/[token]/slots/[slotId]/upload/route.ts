import { NextResponse } from "next/server";
import {
  ClientCaseError,
  saveClientSlotUpload,
} from "@/lib/server/client-case-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string; slotId: string }> },
) {
  const { token, slotId } = await context.params;

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const caseRecord = await saveClientSlotUpload(
      token,
      slotId,
      buffer,
      file.name,
      file.type,
    );
    return NextResponse.json({ case: caseRecord });
  } catch (error) {
    if (error instanceof ClientCaseError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
}
