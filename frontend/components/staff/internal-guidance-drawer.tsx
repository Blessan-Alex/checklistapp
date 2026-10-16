"use client";

import { useState } from "react";
import { BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SimpleMarkdown } from "@/lib/simple-markdown";

/** Staff-only guidance (CLIENT-INSTRUCTIONS.md §6.4). */
const INTERNAL_GUIDANCE = `### Pending CoS
Employer letter confirming CoS issuance if CoS unavailable.

### Prove relationship
Chats, calls, emails, photos — **dated**, as old as possible; show continuity.

### Living together
Two document types over **2 years** (tenancy + council tax); otherwise maximum available (bank, utilities, bills).

### First-time 6135/36 (switch)
Bank statements + payslips **3 months before CoS issue date** (check CoS).

### Skilled Worker maintenance
Maintenance ticked on CoS for all (including dependants). If not ticked: all in UK **> 1 year** else bank statements for funds.

### NMC
NMC certificate for doctors/nurses etc.

### ILR / naturalisation
English language (if required) + **Life in the UK** certificate.

### Outside UK
TB where required; PCC for health/care/education (main or dependant).

### e-Visa / Share Code
Same as client copy; all passports/scans must meet the quality bar.`;

export function InternalGuidanceDrawer({
  className,
}: {
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={className ?? "min-h-9 gap-1.5 text-muted-foreground"}
        onClick={() => setOpen(true)}
      >
        <BookMarked className="size-4" aria-hidden />
        Guidance
      </Button>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Internal guidance</SheetTitle>
          <SheetDescription>
            Staff reference when reviewing packs — not shown to clients by
            default.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4 text-sm text-foreground">
          <SimpleMarkdown content={INTERNAL_GUIDANCE} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
