"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { generateDemoClientToken, getCases } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

export const DEMO_CASE_FOCUS_KEY = "demoCaseFocus";

const DEMO_CASES: { id: string; label: string }[] = [
  { id: "case-dino", label: "Dino Dominic (SW)" },
  { id: "case-sophy", label: "Sophy Bijumon (ILR)" },
];

function readStoredFocusId(): string {
  if (typeof window === "undefined") {
    return DEMO_CASES[0].id;
  }
  const stored = sessionStorage.getItem(DEMO_CASE_FOCUS_KEY);
  if (stored && DEMO_CASES.some((c) => c.id === stored)) {
    return stored;
  }
  return DEMO_CASES[0].id;
}

export function DemoCaseSwitcher({ className }: { className?: string }) {
  const router = useRouter();
  const [focusId, setFocusId] = useState(readStoredFocusId);

  const clientToken = generateDemoClientToken(focusId);
  const clientHref = ROUTES.clientPortal(clientToken);

  function handleChange(caseId: string) {
    setFocusId(caseId);
    sessionStorage.setItem(DEMO_CASE_FOCUS_KEY, caseId);
    const cases = getCases();
    const target = cases.find((c) => c.id === caseId);
    if (target) {
      router.push(ROUTES.staffCaseReview(target.id));
    }
  }

  return (
    <div
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-1.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <label className="flex items-center gap-1.5">
        <span className="sr-only">Demo case</span>
        <select
          value={focusId}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-10 max-w-[11rem] rounded-lg border border-input/80 bg-background px-2 text-sm text-foreground sm:max-w-none"
          aria-label="Demo case"
        >
          {DEMO_CASES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <Link
        href={clientHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        title={`Open client portal (${clientToken})`}
      >
        Client view
        <ExternalLink className="size-3.5 shrink-0 opacity-70" aria-hidden />
      </Link>
    </div>
  );
}
