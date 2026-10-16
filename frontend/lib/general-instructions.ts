import { readFileSync } from "node:fs";
import { join } from "node:path";

let cached: string | null = null;

export function getGeneralInstructionsMarkdown(): string {
  if (cached) {
    return cached;
  }
  cached = readFileSync(
    join(process.cwd(), "config/instructions/general.md"),
    "utf8",
  );
  return cached;
}
