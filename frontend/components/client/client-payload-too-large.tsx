import { MAX_CLIENT_FILE_MB } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/** Client portal — file over size limit (413). Inline so users can retry without refresh. */
export function ClientPayloadTooLarge({
  onTryAgain,
}: {
  onTryAgain: () => void;
}) {
  return (
    <Alert variant="destructive" className="text-left">
      <AlertTitle>File too large</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>
          Each document must be {MAX_CLIENT_FILE_MB} MB or smaller. Compress the
          file or choose a smaller export, then try again.
        </p>
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
