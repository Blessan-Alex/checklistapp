"use client";

import { useMemo, useState } from "react";
import { AppShellClient } from "@/components/shells/app-shell-client";
import { AppShellStaff } from "@/components/shells/app-shell-staff";
import { SlotCard } from "@/components/client/slot-card";
import { SlotTable } from "@/components/staff/slot-table";
import { CopyLinkButton } from "@/components/shared/copy-link-button";
import { DontList } from "@/components/shared/dont-list";
import { InstructionPanel } from "@/components/shared/instruction-panel";
import { RouteBadge } from "@/components/shared/route-badge";
import { SampleThumb } from "@/components/shared/sample-thumb";
import { StatusChip } from "@/components/shared/status-chip";
import { UploadDropzone } from "@/components/shared/upload-dropzone";
import type { Case, CaseStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const ALL_STATUSES: CaseStatus[] = [
  "draft",
  "live",
  "client_in_progress",
  "submitted",
  "zip_ready",
];

export function ComponentShowcase({
  dinoCase,
  generalInstructions,
}: {
  dinoCase: Case;
  generalInstructions: string;
}) {
  const [shell, setShell] = useState<"staff" | "client">("staff");
  const shareSlot = useMemo(
    () =>
      dinoCase.slots.find(
        (s) => s.instructionType === "sharecode" && s.personFirstName === "Dino",
      ),
    [dinoCase.slots],
  );
  const clientSlots = dinoCase.slots.filter((s) => s.clientUpload);
  const completed = 2;

  const inner = (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Status & route</h2>
        <div className="flex flex-wrap gap-2">
          <RouteBadge route="skilled_worker" />
          <RouteBadge route="ilr" />
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Instructions</h2>
        <InstructionPanel title="Before you start" content={generalInstructions} />
        {shareSlot ? (
          <>
            <InstructionPanel
              title={shareSlot.targetFileName}
              content={shareSlot.instructions}
            />
            <DontList items={shareSlot.donts} />
          </>
        ) : null}
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Upload & samples</h2>
        {shareSlot?.sampleUrl ? (
          <SampleThumb
            sampleUrl={shareSlot.sampleUrl}
            alt="Share code example"
          />
        ) : null}
        <UploadDropzone onFileSelect={() => undefined} />
        <CopyLinkButton url="http://localhost:3000/c/demo-dino" />
      </section>

      <Separator />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-primary">Slots</h2>
        <SlotTable slots={dinoCase.slots.slice(0, 6)} />
        <div className="max-w-lg space-y-3">
          {clientSlots.slice(0, 3).map((slot) => (
            <SlotCard
              key={slot.id}
              slot={{
                ...slot,
                upload: slot.id === clientSlots[0]?.id
                  ? {
                      name: "passport.pdf",
                      size: 1024,
                      uploadedAt: "2026-01-01T12:00:00.000Z",
                    }
                  : undefined,
              }}
              href={`/c/demo-dino/slot/${slot.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={cn(
            "min-h-11 rounded-lg border px-4 text-sm font-medium",
            shell === "staff" && "bg-primary text-primary-foreground",
          )}
          onClick={() => setShell("staff")}
        >
          Staff shell
        </button>
        <button
          type="button"
          className={cn(
            "min-h-11 rounded-lg border px-4 text-sm font-medium",
            shell === "client" && "bg-primary text-primary-foreground",
          )}
          onClick={() => setShell("client")}
        >
          Client shell
        </button>
      </div>

      {shell === "staff" ? (
        <AppShellStaff activeNav="cases">{inner}</AppShellStaff>
      ) : (
        <AppShellClient
          applicantFirstName={dinoCase.applicantFirstName}
          completed={completed}
          total={clientSlots.length}
          homeHref="/c/demo-dino"
        >
          {inner}
        </AppShellClient>
      )}
    </div>
  );
}
