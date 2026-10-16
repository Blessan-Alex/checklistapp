"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isSlotRejected } from "@/lib/slot-status";
import type { Slot, SlotSource } from "@/lib/types";
import { cn } from "@/lib/utils";

const SOURCE_LABEL: Record<SlotSource, string> = {
  home_office: "HO",
  firm: "Firm",
  manual: "Added",
};

function uploadStatusLabel(slot: Slot): string {
  if (!slot.clientUpload) {
    return "Generated — adviser";
  }
  if (isSlotRejected(slot)) {
    return "Replacement requested";
  }
  if (slot.upload) {
    return slot.upload.name;
  }
  return "Waiting for client";
}

export function SlotTable({
  slots,
  className,
  showUploadStatus = false,
  showStaffActions = false,
  onRejectSlot,
}: {
  slots: Slot[];
  className?: string;
  showUploadStatus?: boolean;
  showStaffActions?: boolean;
  onRejectSlot?: (slot: Slot) => void;
}) {
  const showActions = showStaffActions && Boolean(onRejectSlot);

  return (
    <div className={cn("min-w-0", className)}>
      <div className="hidden min-w-0 overflow-x-auto rounded-lg border lg:block">
        <Table className="min-w-[52rem]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Document name</TableHead>
              <TableHead>Pack label</TableHead>
              <TableHead>First name</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Client upload?</TableHead>
              {showUploadStatus ? (
                <TableHead>Upload status</TableHead>
              ) : null}
              {showActions ? <TableHead className="w-28">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {slots.map((slot) => {
              const rejected = isSlotRejected(slot);
              return (
                <TableRow
                  key={slot.id}
                  className={rejected ? "bg-[color-mix(in_srgb,var(--brand-golden-ochre)_10%,transparent)]" : undefined}
                >
                  <TableCell className="font-medium tabular-nums">
                    {slot.sortNumber}
                  </TableCell>
                  <TableCell>{slot.documentName}</TableCell>
                  <TableCell className="max-w-[12rem] truncate font-medium">
                    {slot.targetFileName}
                  </TableCell>
                  <TableCell>{slot.personFirstName ?? "—"}</TableCell>
                  <TableCell>{SOURCE_LABEL[slot.source]}</TableCell>
                  <TableCell>
                    {slot.clientUpload ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="border-primary/30 text-primary"
                      >
                        Generated — adviser
                      </Badge>
                    )}
                  </TableCell>
                  {showUploadStatus ? (
                    <TableCell className="max-w-[14rem] truncate text-muted-foreground">
                      {uploadStatusLabel(slot)}
                      {rejected && slot.rejection ? (
                        <span className="mt-0.5 block text-xs text-[var(--brand-golden-ochre)]">
                          {slot.rejection.message}
                        </span>
                      ) : null}
                    </TableCell>
                  ) : null}
                  {showActions ? (
                    <TableCell>
                      {slot.clientUpload && slot.upload ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="min-h-9"
                          onClick={() => onRejectSlot?.(slot)}
                        >
                          Reject
                        </Button>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 lg:hidden">
        {slots.map((slot) => {
          const rejected = isSlotRejected(slot);
          return (
            <li
              key={slot.id}
              className={cn(
                "rounded-lg border border-border bg-card p-4 text-sm shadow-sm",
                rejected &&
                  "border-[var(--brand-golden-ochre)]/50 bg-[color-mix(in_srgb,var(--brand-golden-ochre)_8%,var(--brand-warm-ivory))]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-semibold text-primary">#{slot.sortNumber}</span>
                {slot.clientUpload ? (
                  <Badge variant="secondary">Client upload</Badge>
                ) : (
                  <Badge variant="outline" className="text-primary">
                    Generated — adviser
                  </Badge>
                )}
              </div>
              <p className="mt-1 font-medium">{slot.targetFileName}</p>
              <p className="text-xs text-muted-foreground">{slot.documentName}</p>
              <p className="text-muted-foreground">
                {slot.personFirstName ?? "—"} · {SOURCE_LABEL[slot.source]}
              </p>
              {showUploadStatus ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {uploadStatusLabel(slot)}
                </p>
              ) : null}
              {rejected && slot.rejection ? (
                <p className="mt-2 text-xs text-[var(--brand-golden-ochre)]">
                  {slot.rejection.message}
                </p>
              ) : null}
              {showActions && slot.clientUpload && slot.upload ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3 min-h-9"
                  onClick={() => onRejectSlot?.(slot)}
                >
                  Reject upload
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
