"use client";

import Image from "next/image";
import { useState } from "react";
import { Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function SampleThumb({
  sampleUrl,
  alt = "Example document",
  className,
}: {
  sampleUrl: string;
  alt?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "group relative flex min-h-11 w-full max-w-xs flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition hover:border-primary/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          className,
        )}
      >
        <div className="relative aspect-[8/5] w-full bg-muted/40">
          <Image
            src={sampleUrl}
            alt={alt}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 100vw, 320px"
          />
          <span
            className="absolute inset-0 flex items-center justify-center bg-[var(--brand-dark-indigo)]/0 transition group-hover:bg-[var(--brand-dark-indigo)]/25"
            aria-hidden
          >
            <Expand className="size-6 text-[var(--brand-warm-ivory)] opacity-0 transition group-hover:opacity-100" />
          </span>
        </div>
        <span className="px-3 py-2 text-xs font-medium text-muted-foreground">
          See example
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Example</DialogTitle>
            <DialogDescription>{alt}</DialogDescription>
          </DialogHeader>
          <div className="relative max-h-[70vh] w-full overflow-auto rounded-md border bg-muted/30">
            <Image
              src={sampleUrl}
              alt={alt}
              width={800}
              height={500}
              className="h-auto w-full"
            />
          </div>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
