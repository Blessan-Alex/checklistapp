"use client";

import { useEffect, useState } from "react";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

export function PublishDialog({
  open,
  onOpenChange,
  applicantName,
  publishedUrl,
  onConfirmPublish,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicantName: string;
  publishedUrl?: string;
  onConfirmPublish: () => void | Promise<void>;
}) {
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!open) {
      setPublishing(false);
    }
  }, [open]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
  }

  async function handlePublish() {
    if (publishing) {
      return;
    }
    setPublishing(true);
    try {
      await onConfirmPublish();
    } finally {
      setPublishing(false);
    }
  }

  const showLink = Boolean(publishedUrl);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {showLink ? "Client link ready" : "Publish to client?"}
          </DialogTitle>
          <DialogDescription>
            {showLink
              ? `Share this link with ${applicantName} so they can upload documents.`
              : "The client will see their checklist and can upload files."}
          </DialogDescription>
        </DialogHeader>

        {showLink ? (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
            <p className="break-all font-mono text-xs text-foreground">
              {publishedUrl}
            </p>
            <CopyLinkButton url={publishedUrl!} label="Copy client link" />
          </div>
        ) : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            {showLink ? "Done" : "Cancel"}
          </Button>
          {!showLink ? (
            <Button
              type="button"
              disabled={publishing}
              onClick={() => void handlePublish()}
            >
              {publishing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Publish
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
