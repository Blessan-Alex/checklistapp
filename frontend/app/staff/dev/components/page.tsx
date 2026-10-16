import { readFileSync } from "node:fs";
import { join } from "node:path";
import caseDino from "@/config/mock/case-dino.json";
import type { Case } from "@/lib/types";
import { ComponentShowcase } from "./component-showcase";

export const instant = false;

export default function StaffDevComponentsPage() {
  const generalInstructions = readFileSync(
    join(process.cwd(), "config/instructions/general.md"),
    "utf8",
  );

  return (
    <div className="min-h-full bg-muted/30 py-6">
      <div className="mx-auto max-w-6xl px-4">
        <p className="mb-4 text-sm text-muted-foreground">
          Prompt 1.3 component gallery —{" "}
          <code className="rounded bg-muted px-1">/staff/dev/components</code>
        </p>
        <ComponentShowcase
          dinoCase={caseDino as Case}
          generalInstructions={generalInstructions}
        />
      </div>
    </div>
  );
}
