"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { ROUTES } from "@/config/routes";
import {
  MAX_STAFF_CHECKLIST_BYTES,
  MOCK_PARSE_DELAY_MS,
} from "@/lib/constants";
import { useMockDataSource } from "@/lib/data-source";
import { ApiError } from "@/lib/api-client";
import { useCreateCaseMutation } from "@/lib/hooks/use-case-api";
import {
  ChecklistParseError,
  UnsupportedChecklistError,
} from "@/lib/checklist-parse-errors";
import { parseChecklistFileName } from "@/lib/mock-parse";
import { upsertCaseFromParsedChecklist } from "@/lib/mock-store";
import { toast } from "sonner";

export function NewCaseUpload() {
  const router = useRouter();
  const mockData = useMockDataSource();
  const createCase = useCreateCaseMutation();
  const [parsing, setParsing] = useState(false);

  function handleFileSelect(file: File) {
    if (parsing) {
      return;
    }
    setParsing(true);

    if (!mockData) {
      void createCase
        .mutateAsync(file)
        .then((result) => {
          router.push(ROUTES.staffCaseReview(result.case.id));
        })
        .catch((error: unknown) => {
          if (error instanceof ApiError) {
            toast.error(error.message);
            return;
          }
          const message =
            error instanceof Error ? error.message : "Could not create case";
          toast.error(message);
        })
        .finally(() => setParsing(false));
      return;
    }

    let parsed;
    try {
      parsed = parseChecklistFileName(file.name);
    } catch (error: unknown) {
      setParsing(false);
      const message =
        error instanceof ChecklistParseError ||
        error instanceof UnsupportedChecklistError
          ? error.message
          : "Could not read checklist";
      toast.error(message);
      return;
    }

    window.setTimeout(() => {
      const updatedAtIso = new Date().toISOString();
      const caseRecord = upsertCaseFromParsedChecklist(
        file.name,
        parsed,
        updatedAtIso,
      );
      setParsing(false);
      router.push(ROUTES.staffCaseReview(caseRecord.id));
    }, MOCK_PARSE_DELAY_MS);
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-primary">New case</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload the UKVI document checklist PDF. We will read the applicant
          details and suggest a route.
        </p>
      </div>

      {parsing ? (
        <div
          className="flex min-h-[160px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-8"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
          <p className="text-sm font-medium text-foreground">
            Reading checklist…
          </p>
          <p className="text-xs text-muted-foreground">
            Extracting UAN, applicant name, and product line
          </p>
        </div>
      ) : (
        <UploadDropzone
          accept=".pdf"
          maxBytes={MAX_STAFF_CHECKLIST_BYTES}
          hint="PDF only · max 15 MB"
          onFileSelect={handleFileSelect}
        />
      )}
    </div>
  );
}
