import type { ClientUploadErrorKind } from "@/lib/client-slot-upload";
import {
  EFFECTIVE_CLIENT_FILE_MB,
  MAX_CLIENT_FILE_MB,
  getEffectiveClientUploadMaxBytes,
  MAX_CLIENT_FILE_BYTES,
} from "@/lib/constants";

export type ClientUploadUserFacing = {
  title: string;
  reason: string;
  steps: string[];
};

function mapServerMessage(serverMessage: string): ClientUploadErrorKind | null {
  const lower = serverMessage.toLowerCase();
  if (lower.includes("locked") || lower.includes("submission")) {
    return "locked";
  }
  if (lower.includes("too large") || lower.includes("maximum is")) {
    return "too_large";
  }
  if (lower.includes("could not find your file")) {
    return "server_busy";
  }
  if (lower.includes("not available") || lower.includes("invalid slot")) {
    return "unknown";
  }
  return null;
}

export function clientUploadSizeErrorMessage(bytes: number): string {
  const limit = getEffectiveClientUploadMaxBytes();
  const labelMb =
    limit === MAX_CLIENT_FILE_BYTES ? MAX_CLIENT_FILE_MB : EFFECTIVE_CLIENT_FILE_MB;
  return `This file is ${formatMb(bytes)} MB. The maximum is ${labelMb} MB for this upload path.`;
}

function formatMb(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1);
}

export function clientUploadUserMessage(
  kind: ClientUploadErrorKind,
  serverMessage?: string,
): ClientUploadUserFacing {
  const trimmed = serverMessage?.trim();
  const mapped = trimmed ? mapServerMessage(trimmed) : null;
  const effectiveKind = mapped ?? kind;

  if (trimmed && effectiveKind === kind && kind === "unknown") {
    return {
      title: "Upload failed",
      reason: trimmed,
      steps: [
        "Tap Retry upload to try again.",
        "If the problem continues, contact your adviser.",
      ],
    };
  }

  switch (effectiveKind) {
    case "offline":
      return {
        title: "Connection problem",
        reason:
          trimmed ||
          "We could not reach the server. Your connection may have dropped.",
        steps: [
          "Check Wi‑Fi or mobile data.",
          "When you are back online, tap Retry upload.",
        ],
      };
    case "too_large":
      return {
        title: "File too large",
        reason:
          trimmed ||
          `Each document must be ${EFFECTIVE_CLIENT_FILE_MB} MB or smaller.`,
        steps: [
          "Compress the PDF or image, or export a smaller scan.",
          "Choose a different file, then tap Try another file.",
        ],
      };
    case "locked":
      return {
        title: "Uploads closed",
        reason:
          trimmed ||
          "This checklist is closed except where your adviser asked for an updated file.",
        steps: [
          "Open the document marked “Fix this document” on your checklist.",
          "If you need to change something else, contact your adviser.",
        ],
      };
    case "server_busy":
      return {
        title: "Please try again",
        reason:
          trimmed ||
          "The server is busy or your file is still being saved.",
        steps: [
          "Wait a few seconds, then tap Retry upload.",
          "Try a stronger connection if it keeps failing.",
        ],
      };
    case "timeout":
      return {
        title: "Upload timed out",
        reason: "The upload took too long to finish.",
        steps: [
          "Use a smaller file or a faster connection.",
          "Tap Retry upload.",
        ],
      };
    case "cancelled":
      return {
        title: "Upload cancelled",
        reason: "You stopped the upload.",
        steps: ["Choose your file again when you are ready."],
      };
    default:
      return {
        title: "Upload failed",
        reason: trimmed || "Something went wrong while saving your file.",
        steps: [
          "Tap Retry upload.",
          "If it still fails, contact your adviser with the file name.",
        ],
      };
  }
}
