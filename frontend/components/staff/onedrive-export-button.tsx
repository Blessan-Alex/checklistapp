"use client";

import { useState } from "react";
import { CloudUpload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { features } from "@/lib/features";
import { getArchiveRootName } from "@/lib/zip-manifest";
import type { Case } from "@/lib/types";

export function OneDriveExportButton({ caseRecord }: { caseRecord: Case }) {
  const [open, setOpen] = useState(false);

  if (!features.oneDriveExport) {
    return null;
  }

  const folderPath = `Immigration/${getArchiveRootName(caseRecord)}`;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full gap-2 sm:w-auto"
        onClick={() => setOpen(true)}
      >
        <CloudUpload className="size-4" aria-hidden />
        Send to OneDrive
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>OneDrive export</DialogTitle>
            <DialogDescription>
              Microsoft Graph integration will upload the zip to your firm
              SharePoint library. This build shows the target path only.
            </DialogDescription>
          </DialogHeader>
          <p className="font-mono text-xs break-all rounded-lg border bg-muted/40 p-3">
            {folderPath}
          </p>
          <DialogFooter>
            <Button
              type="button"
              className="min-h-11"
              onClick={() => {
                toast.message("OneDrive export queued (stub)", {
                  description: "Connect Graph API in a future release.",
                });
                setOpen(false);
              }}
            >
              Queue upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
