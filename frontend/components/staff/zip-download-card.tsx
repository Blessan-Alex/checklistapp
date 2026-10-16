"use client";

import { useMemo, useState } from "react";
import { Archive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { useMockDataSource } from "@/lib/data-source";
import { formatBytes } from "@/lib/format-bytes";
import {
  buildZipManifestText,
  downloadZipManifestFile,
  getArchiveRootName,
  slotDocumentZipName,
} from "@/lib/zip-manifest";
import { OneDriveExportButton } from "@/components/staff/onedrive-export-button";
import { markCaseZipReady } from "@/lib/mock-store";
import type { Case } from "@/lib/types";
import { toast } from "sonner";

export function ZipDownloadCard({
  caseRecord,
  onStoreChange,
}: {
  caseRecord: Case;
  onStoreChange?: () => void;
}) {
  const mockData = useMockDataSource();
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const manifest = useMemo(
    () => buildZipManifestText(caseRecord),
    [caseRecord],
  );
  const root = getArchiveRootName(caseRecord);

  const canDownload =
    caseRecord.status === "submitted" ||
    caseRecord.status === "zip_ready";

  async function handleDownload() {
    if (mockData) {
      downloadZipManifestFile(caseRecord);
      markCaseZipReady(caseRecord.id);
      onStoreChange?.();
      const size = new Blob([manifest], { type: "text/plain" }).size;
      toast.success("Manifest downloaded", {
        description: `${formatBytes(size)} · Enable API mode for a real zip file.`,
      });
      setOpen(false);
      return;
    }

    setDownloading(true);
    try {
      const blob = await api.downloadCaseZip(caseRecord.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${root}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      onStoreChange?.();
      toast.success("Zip downloaded", {
        description: formatBytes(blob.size),
      });
      setOpen(false);
    } catch {
      toast.error("Could not build zip");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Archive className="size-4 text-primary" aria-hidden />
            Document pack
          </CardTitle>
          <CardDescription>
            Renamed files ready for the Home Office pack.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Button
            type="button"
            className="min-h-11 w-full sm:w-auto"
            disabled={!canDownload}
            onClick={() => setOpen(true)}
          >
            Download zip
          </Button>
          <OneDriveExportButton caseRecord={caseRecord} />
          {!canDownload ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Available after the client submits
              {mockData ? ", or use Simulate client completed." : "."}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Zip manifest preview</DialogTitle>
            <DialogDescription>
              Files staff will receive under{" "}
              <span className="font-mono text-foreground">{root}/</span>
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[50vh] space-y-3 overflow-auto">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Documents/
              </p>
              <ul className="mt-1 space-y-1 font-mono text-xs">
                {caseRecord.slots.map((slot) => (
                  <li
                    key={slot.id}
                    className="rounded bg-muted/40 px-2 py-1 font-mono text-xs"
                  >
                    {slotDocumentZipName(slot)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground">
                Misc/
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {caseRecord.checklistFileName ?? "Submitted checklist.pdf"}
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button
              type="button"
              className="min-h-11"
              disabled={downloading}
              onClick={() => void handleDownload()}
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Download zip
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
