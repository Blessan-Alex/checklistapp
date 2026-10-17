import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ClientUploadErrorKind } from "@/lib/client-slot-upload";

const TITLES: Record<ClientUploadErrorKind, string> = {
  offline: "Connection problem",
  too_large: "File too large",
  locked: "Uploads closed",
  server_busy: "Please try again",
  timeout: "Upload timed out",
  cancelled: "Upload cancelled",
  unknown: "Upload failed",
};

export function ClientUploadError({
  kind,
  message,
  onRetry,
  onDismiss,
}: {
  kind: ClientUploadErrorKind;
  message: string;
  onRetry: () => void;
  onDismiss?: () => void;
}) {
  return (
    <Alert variant="destructive" className="text-left">
      <AlertTitle>{TITLES[kind]}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{message}</p>
        <div className="flex flex-wrap gap-2">
          {kind !== "locked" && kind !== "too_large" ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 border-destructive/40 bg-background"
              onClick={onRetry}
            >
              Retry upload
            </Button>
          ) : null}
          {onDismiss ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          ) : null}
        </div>
      </AlertDescription>
    </Alert>
  );
}
