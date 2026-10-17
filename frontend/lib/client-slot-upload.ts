import { upload } from "@vercel/blob/client";
import type { Case } from "@/lib/types";
import { USE_CLIENT_BLOB_UPLOADS } from "@/lib/constants";
import { validateClientUploadSize } from "@/lib/client-upload-validation";
import { slotUploadBlobPathname } from "@/lib/slot-upload-pathname";
import { ApiError } from "@/lib/api-client";

export type ClientUploadErrorKind =
  | "offline"
  | "too_large"
  | "locked"
  | "server_busy"
  | "timeout"
  | "cancelled"
  | "unknown";

export class ClientSlotUploadError extends Error {
  constructor(
    message: string,
    readonly kind: ClientUploadErrorKind,
    readonly status: number,
  ) {
    super(message);
    this.name = "ClientSlotUploadError";
  }
}

const UPLOAD_TIMEOUT_MS = 120_000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1000, 2000, 4000];

function cancelledError(): ClientSlotUploadError {
  return new ClientSlotUploadError("Upload cancelled.", "cancelled", 0);
}

function isRetryableStatus(status: number): boolean {
  return (
    status === 408 ||
    status === 429 ||
    (status >= 502 && status <= 504)
  );
}

function classifyUploadFailure(
  status: number,
  message: string,
): ClientSlotUploadError {
  if (message.toLowerCase().includes("cancel")) {
    return cancelledError();
  }
  if (typeof navigator !== "undefined" && !navigator.onLine && status === 0) {
    return new ClientSlotUploadError(
      "You appear to be offline. Check your connection and try again.",
      "offline",
      0,
    );
  }
  if (status === 413) {
    return new ClientSlotUploadError(message, "too_large", 413);
  }
  if (status === 403) {
    return new ClientSlotUploadError(
      message || "Uploads are closed for this checklist.",
      "locked",
      403,
    );
  }
  if (status === 408) {
    return new ClientSlotUploadError(
      "Upload took too long. Please try again.",
      "timeout",
      408,
    );
  }
  if (status === 0) {
    return new ClientSlotUploadError(
      "Upload interrupted. Please try again.",
      "offline",
      0,
    );
  }
  if (isRetryableStatus(status)) {
    return new ClientSlotUploadError(
      "Server is busy. Please try again.",
      "server_busy",
      status,
    );
  }
  return new ClientSlotUploadError(
    message || "Upload failed. Please try again.",
    "unknown",
    status,
  );
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function fetchClientCase(token: string): Promise<Case | undefined> {
  const response = await fetch(`/api/client/${token}`, { credentials: "include" });
  if (!response.ok) {
    return undefined;
  }
  const body = (await response.json()) as { case?: Case };
  return body.case;
}

async function recoverCaseIfSlotSaved(
  token: string,
  slotId: string,
  file: File,
): Promise<{ case: Case } | null> {
  const caseRecord = await fetchClientCase(token);
  if (!caseRecord) {
    return null;
  }
  const slot = caseRecord.slots.find((s) => s.id === slotId);
  if (
    slot?.upload?.name === file.name &&
    slot.upload.size === file.size
  ) {
    return { case: caseRecord };
  }
  return null;
}

async function confirmClientSlotUpload(
  token: string,
  slotId: string,
  file: File,
): Promise<{ case: Case }> {
  const response = await fetch(
    `/api/client/${token}/slots/${slotId}/upload/confirm`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      }),
    },
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const recovered = await recoverCaseIfSlotSaved(token, slotId, file);
    if (recovered) {
      return recovered;
    }
    const message =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : response.statusText;
    throw classifyUploadFailure(response.status, message);
  }
  return body as { case: Case };
}

async function uploadViaBlob(
  token: string,
  caseId: string,
  slotId: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<{ case: Case }> {
  if (signal?.aborted) {
    throw cancelledError();
  }
  const pathname = slotUploadBlobPathname(caseId, slotId, file.name);
  await upload(pathname, file, {
    access: "private",
    handleUploadUrl: `/api/client/${token}/slots/${slotId}/blob-upload`,
    clientPayload: JSON.stringify({
      originalName: file.name,
      size: file.size,
    }),
    abortSignal: signal,
    onUploadProgress: ({ percentage }) => {
      onProgress(Math.min(100, Math.round(percentage)));
    },
  });
  if (signal?.aborted) {
    throw cancelledError();
  }
  return confirmClientSlotUpload(token, slotId, file);
}

function uploadViaMultipart(
  token: string,
  slotId: string,
  file: File,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<{ case: Case }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    const url = `/api/client/${token}/slots/${slotId}/upload`;
    let userCancelled = false;

    const timeoutId = window.setTimeout(() => {
      xhr.abort();
      reject(
        classifyUploadFailure(408, "Upload took too long. Please try again."),
      );
    }, UPLOAD_TIMEOUT_MS);

    const onAbort = () => {
      userCancelled = true;
      xhr.abort();
      window.clearTimeout(timeoutId);
      reject(cancelledError());
    };
    signal?.addEventListener("abort", onAbort, { once: true });

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress(
          Math.min(100, Math.round((event.loaded / event.total) * 100)),
        );
      }
    });

    xhr.addEventListener("load", () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
      let body: unknown;
      try {
        body = xhr.responseText ? JSON.parse(xhr.responseText) : undefined;
      } catch {
        body = xhr.responseText;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body as { case: Case });
        return;
      }
      const message =
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof (body as { error: unknown }).error === "string"
          ? (body as { error: string }).error
          : xhr.status === 413
            ? "File is too large."
            : xhr.statusText || "Upload failed";
      reject(classifyUploadFailure(xhr.status, message));
    });

    xhr.addEventListener("error", () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
      if (userCancelled) {
        reject(cancelledError());
        return;
      }
      reject(classifyUploadFailure(0, "Upload failed"));
    });

    xhr.addEventListener("abort", () => {
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
      reject(userCancelled ? cancelledError() : cancelledError());
    });

    xhr.open("POST", url);
    xhr.withCredentials = true;
    xhr.send(form);
  });
}

export function shouldUseClientBlobUploads(): boolean {
  return USE_CLIENT_BLOB_UPLOADS;
}

export async function uploadClientSlotFile(params: {
  token: string;
  caseId: string;
  slotId: string;
  file: File;
  onProgress?: (percent: number) => void;
  signal?: AbortSignal;
}): Promise<{ case: Case }> {
  const { token, caseId, slotId, file, onProgress, signal } = params;
  const sizeError = validateClientUploadSize(file);
  if (sizeError) {
    throw new ClientSlotUploadError(sizeError, "too_large", 413);
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new ClientSlotUploadError(
      "You appear to be offline. Check your connection and try again.",
      "offline",
      0,
    );
  }

  const report = onProgress ?? (() => {});

  let lastError: ClientSlotUploadError | undefined;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    if (signal?.aborted) {
      throw cancelledError();
    }
    try {
      if (shouldUseClientBlobUploads()) {
        return await uploadViaBlob(
          token,
          caseId,
          slotId,
          file,
          report,
          signal,
        );
      }
      return await uploadViaMultipart(token, slotId, file, report, signal);
    } catch (error) {
      const normalized =
        error instanceof ClientSlotUploadError
          ? error
          : error instanceof ApiError
            ? classifyUploadFailure(error.status, error.message)
            : classifyUploadFailure(
                0,
                error instanceof Error ? error.message : "Upload failed",
              );
      lastError = normalized;
      if (
        normalized.kind === "cancelled" ||
        normalized.kind === "too_large" ||
        normalized.kind === "locked" ||
        !isRetryableStatus(normalized.status)
      ) {
        throw normalized;
      }
      if (attempt < MAX_ATTEMPTS - 1) {
        await delay(RETRY_DELAYS_MS[attempt] ?? 4000);
      }
    }
  }
  throw lastError ?? classifyUploadFailure(0, "Upload failed");
}
