"use client";

import { useCallback, useRef, useState } from "react";
import { CloudUpload, FileWarning, Loader2 } from "lucide-react";
import { MAX_CLIENT_FILE_BYTES, MAX_CLIENT_FILE_MB } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
  ProgressValue,
} from "@/components/ui/progress";

const DEFAULT_ACCEPT = ".pdf,.jpg,.jpeg,.png";

export interface UploadDropzoneProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxBytes?: number;
  hint?: string;
  className?: string;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number | null;
}

export function UploadDropzone({
  onFileSelect,
  accept = DEFAULT_ACCEPT,
  maxBytes = MAX_CLIENT_FILE_BYTES,
  hint = `PDF, JPG, or PNG · max ${MAX_CLIENT_FILE_MB} MB per file`,
  className,
  disabled = false,
  uploading = false,
  uploadProgress = null,
}: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const validate = useCallback(
    (file: File): string | null => {
      if (file.size > maxBytes) {
        return `File is too large (max ${Math.round(maxBytes / (1024 * 1024))} MB).`;
      }
      const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      const allowed = accept.split(",").map((a) => a.trim().toLowerCase());
      if (!allowed.includes(ext)) {
        return `File type not allowed. Accepted: ${accept}`;
      }
      return null;
    },
    [accept, maxBytes],
  );

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      const validationError = validate(file);
      if (validationError) {
        setError(validationError);
        setFileName(null);
        return;
      }
      setError(null);
      setFileName(file.name);
      onFileSelect?.(file);
    },
    [onFileSelect, validate],
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onClick={() => {
          if (!disabled && !uploading) {
            inputRef.current?.click();
          }
        }}
        className={cn(
          "flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition",
          disabled || uploading
            ? "cursor-not-allowed opacity-60"
            : dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-card hover:border-primary/50",
          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
      >
        {uploading ? (
          <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
        ) : (
          <CloudUpload className="size-8 text-primary" aria-hidden />
        )}
        <p className="text-sm font-medium text-foreground">
          {uploading ? "Uploading…" : "Drag and drop or tap to choose a file"}
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          disabled={disabled || uploading}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {uploading && uploadProgress !== null ? (
        <Progress value={uploadProgress} className="w-full">
          <ProgressValue />
          <ProgressTrack>
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
      ) : null}
      {fileName ? (
        <p className="text-sm text-muted-foreground">
          Selected: <span className="font-medium text-foreground">{fileName}</span>
        </p>
      ) : null}
      {error ? (
        <p className="flex items-start gap-2 text-sm text-destructive">
          <FileWarning className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}
