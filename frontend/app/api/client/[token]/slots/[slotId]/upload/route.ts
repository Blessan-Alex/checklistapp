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

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Upload too large or request could not be read." },
      { status: 413 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json(
      { error: "Could not read file. Try again or use a smaller file." },
      { status: 400 },
    );
  }

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
