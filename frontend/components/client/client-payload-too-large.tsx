import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { clientUploadUserMessage } from "@/lib/client-upload-user-messages";

/** Client portal — file over size limit (413). Inline so users can retry without refresh. */
export function ClientPayloadTooLarge({
  onTryAgain,
  reason,
}: {
  onTryAgain: () => void;
  reason?: string;
}) {
  const copy = clientUploadUserMessage("too_large", reason);

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11 border-destructive/40 bg-background"
          onClick={onTryAgain}
        >
          Try another file
        </Button>
      </AlertDescription>
    </Alert>
  );
}
