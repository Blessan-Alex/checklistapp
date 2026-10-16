"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMockDataSource } from "@/lib/data-source";
import { useSaveCaseMutation } from "@/lib/hooks/use-case-api";
import {
  buildCoverLetterHtml,
  buildCoverLetterPlainText,
  coverLetterDownloadName,
  defaultCoverLetterDraft,
  routeCoverLetterLabel,
  type CoverLetterDraft,
} from "@/lib/cover-letter";
import { saveCaseRecord } from "@/lib/mock-store";
import type { Case } from "@/lib/types";
import { toast } from "sonner";

export function CoverLetterPanel({
  caseRecord,
  onSaved,
}: {
  caseRecord: Case;
  onSaved?: () => void;
}) {
  const mockData = useMockDataSource();
  const saveMutation = useSaveCaseMutation();
  const [draft, setDraft] = useState<CoverLetterDraft>(() =>
    defaultCoverLetterDraft(caseRecord),
  );
  const previewHtml = useMemo(
    () => buildCoverLetterHtml(caseRecord, draft),
    [caseRecord, draft],
  );

  const previewSrc = useMemo(() => {
    const blob = new Blob([previewHtml], { type: "text/html;charset=utf-8" });
    return URL.createObjectURL(blob);
  }, [previewHtml]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(previewSrc);
    };
  }, [previewSrc]);

  function patchDraft(patch: Partial<CoverLetterDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function persistCoverLetter(next: CoverLetterDraft) {
    const payload: Case = {
      ...caseRecord,
      coverLetter: next,
      updatedAt: new Date().toISOString(),
    };
    if (mockData) {
      saveCaseRecord(payload);
      onSaved?.();
      return;
    }
    await saveMutation.mutateAsync({
      id: caseRecord.id,
      patch: { coverLetter: next, updatedAt: payload.updatedAt },
    });
    onSaved?.();
  }

  async function handleSaveFields() {
    try {
      await persistCoverLetter(draft);
      toast.success("Cover letter fields saved");
    } catch {
      toast.error("Could not save cover letter");
    }
  }

  async function handleRegenerate() {
    const next: CoverLetterDraft = {
      ...draft,
      lastGeneratedAt: new Date().toISOString(),
    };
    setDraft(next);
    try {
      await persistCoverLetter(next);
      toast.success("Preview updated");
    } catch {
      toast.error("Could not save preview");
    }
  }

  function handleDownloadPreview() {
    const text = buildCoverLetterPlainText(caseRecord, draft);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = coverLetterDownloadName(caseRecord);
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded", {
      description: "Plain-text preview until DOCX generation is wired.",
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">
            {routeCoverLetterLabel(caseRecord.route)}
          </CardTitle>
          <CardDescription>
            Generated for the client pack — not uploaded by the client. UAN{" "}
            <span className="font-mono text-foreground">{caseRecord.uan}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {caseRecord.route === "skilled_worker" ? (
            <div className="space-y-2">
              <Label htmlFor="cl-partner">Partner name (cover letter)</Label>
              <Input
                id="cl-partner"
                value={draft.partnerName ?? ""}
                onChange={(e) => patchDraft({ partnerName: e.target.value })}
                placeholder={caseRecord.partnerFullName ?? "Partner name"}
              />
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cl-grant-from">Leave granted from</Label>
                  <Input
                    id="cl-grant-from"
                    type="date"
                    value={draft.leaveGrantedFrom ?? ""}
                    onChange={(e) =>
                      patchDraft({ leaveGrantedFrom: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cl-grant-to">Leave granted to</Label>
                  <Input
                    id="cl-grant-to"
                    type="date"
                    value={draft.leaveGrantedTo ?? ""}
                    onChange={(e) =>
                      patchDraft({ leaveGrantedTo: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cl-lituk">Life in the UK / English reference</Label>
                <Input
                  id="cl-lituk"
                  value={draft.litUkReference ?? ""}
                  onChange={(e) =>
                    patchDraft({ litUkReference: e.target.value })
                  }
                  placeholder="Certificate or reference number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cl-absence">Absence summary</Label>
                <textarea
                  id="cl-absence"
                  rows={3}
                  value={draft.absenceSummary ?? ""}
                  onChange={(e) =>
                    patchDraft({ absenceSummary: e.target.value })
                  }
                  placeholder="Dates and purpose of absences from the UK"
                  className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="cl-notes">Solicitor notes (optional)</Label>
            <textarea
              id="cl-notes"
              rows={3}
              value={draft.solicitorNotes ?? ""}
              onChange={(e) => patchDraft({ solicitorNotes: e.target.value })}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              onClick={() => void handleSaveFields()}
            >
              Save fields
            </Button>
            <Button
              type="button"
              className="min-h-11 gap-2"
              onClick={() => void handleRegenerate()}
            >
              <RefreshCw className="size-4" aria-hidden />
              Regenerate preview
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="min-h-11 gap-2"
              onClick={handleDownloadPreview}
            >
              <Download className="size-4" aria-hidden />
              Download preview
            </Button>
          </div>
          {draft.lastGeneratedAt ? (
            <p className="text-xs text-muted-foreground">
              Last regenerated{" "}
              {new Intl.DateTimeFormat("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(draft.lastGeneratedAt))}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/80">
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
          <CardDescription>
            {caseRecord.applicantFullName} · UAN {caseRecord.uan}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <iframe
            title="Cover letter preview"
            src={previewSrc}
            className="h-[min(70vh,32rem)] w-full rounded-lg border bg-[var(--brand-warm-ivory)]"
          />
        </CardContent>
      </Card>
    </div>
  );
}
