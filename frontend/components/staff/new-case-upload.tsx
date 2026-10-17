"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import { ROUTES } from "@/config/routes";
import { MAX_STAFF_CHECKLIST_BYTES } from "@/lib/constants";
import { ApiError } from "@/lib/api-client";
import { useCreateCaseMutation } from "@/lib/hooks/use-case-api";
import { toast } from "sonner";

export function NewCaseUpload() {
  const router = useRouter();
  const createCase = useCreateCaseMutation();
  const [parsing, setParsing] = useState(false);

  function handleFileSelect(file: File) {
    if (parsing) {
      return;
    }
    setParsing(true);

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
