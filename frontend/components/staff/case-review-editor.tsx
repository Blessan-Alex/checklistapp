"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Plus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AddSlotDialog } from "@/components/staff/add-slot-dialog";
import { InternalGuidanceDrawer } from "@/components/staff/internal-guidance-drawer";
import { PublishDialog } from "@/components/staff/publish-dialog";
import { SlotTable } from "@/components/staff/slot-table";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { RouteBadge } from "@/components/shared/route-badge";
import { StatusChip } from "@/components/shared/status-chip";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { clientPortalAbsoluteUrl } from "@/lib/client-portal-url";
import {
  createManualSlot,
  createSuggestedPreviousPassportsSlot,
  type AddManualSlotInput,
} from "@/lib/add-manual-slot";
import { showPreviousPassportsSuggestion } from "@/lib/checklist-hints";
import { rebuildCaseSlots } from "@/lib/case-slots";
import {
  usePublishCaseMutation,
  useSaveCaseMutation,
} from "@/lib/hooks/use-case-api";
import type { Case, Route } from "@/lib/types";
import { countClientUploadSlots } from "@/lib/slot-builder";

const TITLES: Case["title"][] = ["Mr", "Mrs", "Ms", "Miss"];

export function CaseReviewEditor({
  initialCase,
}: {
  initialCase: Case;
}) {
  const saveMutation = useSaveCaseMutation();
  const publishMutation = usePublishCaseMutation();
  const [draft, setDraft] = useState<Case>(initialCase);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | undefined>();
  const [parseWarningDismissed, setParseWarningDismissed] = useState(false);
  const [addSlotOpen, setAddSlotOpen] = useState(false);

  const refreshSlots = useCallback(
    (next: Case): Case => ({
      ...next,
      slots: rebuildCaseSlots(next, next.slots),
    }),
    [],
  );

  function patchCase(patch: Partial<Case>) {
    setDraft((prev) => {
      let next = { ...prev, ...patch };
      const routeChanged =
        patch.route !== undefined && patch.route !== prev.route;
      const namesChanged =
        patch.applicantFirstName !== undefined ||
        patch.partnerFirstName !== undefined;
      const dependantChanged =
        patch.dependantPack !== undefined &&
        patch.dependantPack !== prev.dependantPack;

      if (routeChanged) {
        if (patch.route === "ilr") {
          next = {
            ...next,
            dependantPack: false,
            partnerFirstName: undefined,
            partnerFullName: undefined,
          };
        }
        next = refreshSlots(next);
      } else if (namesChanged || dependantChanged) {
        next = refreshSlots(next);
      }

      return next;
    });
  }

  async function handleSaveDraft() {
    const payload = {
      ...draft,
      status: "draft" as const,
      updatedAt: new Date().toISOString(),
    };
    try {
      const saved = await saveMutation.mutateAsync({
        id: draft.id,
        patch: payload,
      });
      setDraft(saved);
      toast.success("Draft saved");
    } catch {
      toast.error("Could not save draft");
    }
  }

  async function handleConfirmPublish() {
    try {
      await saveMutation.mutateAsync({
        id: draft.id,
        patch: {
          ...draft,
          status: "draft",
          updatedAt: new Date().toISOString(),
        },
      });
      const result = await publishMutation.mutateAsync(draft.id);
      setDraft(result.case);
      setPublishedUrl(result.clientUrl);
      toast.success("Case published — share the client link below");
    } catch {
      toast.error("Could not publish case");
    }
  }

  function openPublishDialog() {
    setPublishedUrl(undefined);
    setPublishOpen(true);
  }

  const clientUploadCount = countClientUploadSlots(draft.slots);
  const canPublish = draft.status === "draft";
  const showParseWarning =
    draft.parseConfidence === "low" && !parseWarningDismissed;
  const showPreviousPassports = showPreviousPassportsSuggestion(draft);

  function handleAddManualSlot(input: AddManualSlotInput) {
    const slot = createManualSlot(draft, input);
    setDraft((prev) => ({
      ...prev,
      slots: [...prev.slots, slot].sort(
        (a, b) =>
          a.sortNumber - b.sortNumber ||
          a.documentName.localeCompare(b.documentName),
      ),
    }));
    toast.success("Slot added — save draft to keep changes");
  }

  function handleAddPreviousPassportsSlot() {
    const slot = createSuggestedPreviousPassportsSlot(draft);
    setDraft((prev) => ({
      ...prev,
      slots: [...prev.slots, slot].sort(
        (a, b) =>
          a.sortNumber - b.sortNumber ||
          a.documentName.localeCompare(b.documentName),
      ),
    }));
    toast.success("Previous passports slot added — save draft to keep changes");
  }

  return (
    <div className="min-w-0 space-y-6">
      {showParseWarning ? (
        <Alert className="border-[var(--brand-golden-ochre)]/50 bg-[color-mix(in_srgb,var(--brand-golden-ochre)_12%,var(--brand-warm-ivory))]">
          <AlertTriangle className="size-4" aria-hidden />
          <AlertTitle>Check parsed details</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              We could not read everything confidently from the checklist PDF.
              Confirm the UAN, applicant name, and route before you publish.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-9"
              onClick={() => setParseWarningDismissed(true)}
            >
              I have verified this case
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-primary">
              Review — {draft.applicantFullName}
            </h1>
            <RouteBadge route={draft.route} />
            <StatusChip status={draft.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            UAN <span className="font-mono text-foreground">{draft.uan}</span>
            <span className="mx-2 text-border">·</span>
            {clientUploadCount} client uploads
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {draft.clientToken ? (
            <CopyLinkButton
              url={clientPortalAbsoluteUrl(draft.clientToken)}
              label="Copy client link"
              className="min-h-10"
            />
          ) : null}
          <InternalGuidanceDrawer />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="min-h-9 text-muted-foreground"
            onClick={handleSaveDraft}
          >
            Save draft
          </Button>
          <Button
            type="button"
            size="sm"
            className="min-h-10"
            disabled={!canPublish}
            title={
              canPublish
                ? undefined
                : "Save as draft before publishing, or reopen a submitted case."
            }
            onClick={openPublishDialog}
          >
            Publish to client
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {showPreviousPassports ? (
          <Alert className="border-primary/30 bg-primary/5">
            <AlertTitle>ILR checklist hint</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span>
                The parsed checklist mentions <strong>previous passports</strong>.
                Add a slot for the client to upload them.
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="min-h-9 shrink-0"
                onClick={handleAddPreviousPassportsSlot}
              >
                Add previous passports row
              </Button>
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-primary">Document pack</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9 gap-1"
            onClick={() => setAddSlotOpen(true)}
          >
            <Plus className="size-4" aria-hidden />
            Add slot
          </Button>
        </div>
        <SlotTable slots={draft.slots} />
      </div>

      <details className="group rounded-xl border border-border/80 bg-card">
        <summary
          className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-primary marker:content-none [&::-webkit-details-marker]:hidden"
        >
          Case details
          <span className="ml-2 font-normal text-muted-foreground">
            UAN, route, dependants
          </span>
        </summary>
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="sr-only">Case facts</CardTitle>
            <CardDescription className="text-xs">
              Confirm parsed details before publishing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="uan">UAN</Label>
              <Input
                id="uan"
                value={draft.uan}
                onChange={(e) => patchCase({ uan: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-[6rem_1fr]">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <select
                  id="title"
                  className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2 text-sm"
                  value={draft.title}
                  onChange={(e) =>
                    patchCase({ title: e.target.value as Case["title"] })
                  }
                >
                  {TITLES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Applicant full name</Label>
                <Input
                  id="fullName"
                  value={draft.applicantFullName}
                  onChange={(e) =>
                    patchCase({ applicantFullName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">Applicant first name (filenames)</Label>
              <Input
                id="firstName"
                value={draft.applicantFirstName}
                onChange={(e) =>
                  patchCase({ applicantFirstName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="submitted">Submitted date</Label>
              <Input
                id="submitted"
                type="date"
                value={draft.submittedDate}
                onChange={(e) => patchCase({ submittedDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Product / service</Label>
              <p className="text-sm font-medium">{draft.productLine ?? "—"}</p>
            </div>

            <div className="space-y-2">
              <Label>Route</Label>
              <RadioGroup
                value={draft.route}
                onValueChange={(value) =>
                  patchCase({ route: value as Route })
                }
                className="grid gap-2"
              >
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3">
                  <RadioGroupItem value="skilled_worker" />
                  <span className="text-sm font-medium">Skilled Worker</span>
                </label>
                <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-border px-3">
                  <RadioGroupItem value="ilr" />
                  <span className="text-sm font-medium">ILR</span>
                </label>
              </RadioGroup>
            </div>

            {draft.route === "skilled_worker" ? (
              <>
                <label className="flex min-h-11 items-center gap-3 rounded-lg border border-border px-3">
                  <Checkbox
                    checked={draft.dependantPack}
                    onCheckedChange={(checked) =>
                      patchCase({ dependantPack: checked === true })
                    }
                  />
                  <span className="text-sm font-medium">
                    Include dependant / partner pack
                  </span>
                </label>
                {draft.dependantPack ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="partnerFirst">Partner first name</Label>
                      <Input
                        id="partnerFirst"
                        value={draft.partnerFirstName ?? ""}
                        onChange={(e) =>
                          patchCase({ partnerFirstName: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partnerFull">Partner full name</Label>
                      <Input
                        id="partnerFull"
                        value={draft.partnerFullName ?? ""}
                        onChange={(e) =>
                          patchCase({ partnerFullName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>
      </details>

      <AddSlotDialog
        key={addSlotOpen ? `${draft.id}-${draft.slots.length}` : "closed"}
        open={addSlotOpen}
        onOpenChange={setAddSlotOpen}
        caseRecord={draft}
        onAdd={handleAddManualSlot}
      />

      <PublishDialog
        open={publishOpen}
        onOpenChange={setPublishOpen}
        applicantName={draft.applicantFirstName}
        publishedUrl={publishedUrl}
        onConfirmPublish={handleConfirmPublish}
      />
    </div>
  );
}
