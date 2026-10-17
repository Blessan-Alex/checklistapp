import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type { ClientUploadErrorKind } from "@/lib/client-slot-upload";
import { clientUploadUserMessage } from "@/lib/client-upload-user-messages";

export function ClientUploadError({
  kind,
  message,
  onRetry,
  onDismiss,
  onTryAnotherFile,
}: {
  kind: ClientUploadErrorKind;
  message: string;
  onRetry: () => void;
  onDismiss?: () => void;
  onTryAnotherFile?: () => void;
}) {
  const copy = clientUploadUserMessage(kind, message);
  const showRetry =
    kind !== "locked" && kind !== "cancelled" && kind !== "too_large";
  const showTryAnother = kind === "too_large" && onTryAnotherFile;

  return (
    <Alert variant="destructive" className="text-left">
      <AlertTitle>{copy.title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{copy.reason}</p>
        {copy.steps.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {copy.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {showTryAnother ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-11 border-destructive/40 bg-background"
              onClick={onTryAnotherFile}
            >
              Try another file
            </Button>
          ) : null}
          {showRetry ? (
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
