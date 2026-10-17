import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { MAX_CLIENT_FILE_BYTES } from "@/lib/constants";
import {
  ClientCaseError,
  expectedSlotUploadPathname,
  assertClientCanUploadToSlot,
} from "@/lib/server/client-case-service";
import { usesRemoteCaseBlobStorage } from "@/lib/server/case-blob-storage";

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string; slotId: string }> },
) {
  if (!usesRemoteCaseBlobStorage()) {
    return NextResponse.json(
      { error: "Direct blob upload is not enabled on this server." },
      { status: 404 },
    );
  }

  const { token, slotId } = await context.params;
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const caseRecord = await assertClientCanUploadToSlot(token, slotId);

        let originalName = "upload.bin";
        let size = 0;
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload) as {
              originalName?: string;
              size?: number;
            };
            if (parsed.originalName?.trim()) {
              originalName = parsed.originalName.trim();
            }
            if (typeof parsed.size === "number") {
              size = parsed.size;
            }
          } catch {
            /* use default */
          }
        }

        const expected = expectedSlotUploadPathname(
          caseRecord,
          slotId,
          originalName,
        );
        if (pathname !== expected) {
          throw new Error("Invalid upload path");
        }

        return {
          maximumSizeInBytes: MAX_CLIENT_FILE_BYTES,
          allowOverwrite: true,
          tokenPayload: JSON.stringify({
            caseId: caseRecord.id,
            slotId,
            originalName,
            size,
          }),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    if (error instanceof ClientCaseError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
