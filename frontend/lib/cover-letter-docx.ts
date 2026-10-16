import {
  Document,
  Packer,
  Paragraph,
  TextRun,
} from "docx";
import type { Case } from "@/lib/types";
import type { CoverLetterDraft } from "@/lib/cover-letter";
import { buildCoverLetterPlainText } from "@/lib/cover-letter";

export async function buildCoverLetterDocxBlob(
  caseRecord: Case,
  draft: CoverLetterDraft,
): Promise<Blob> {
  const text = buildCoverLetterPlainText(caseRecord, draft);
  const paragraphs = text.split("\n").map(
    (line) =>
      new Paragraph({
        children: [
          new TextRun({
            text: line,
            font: "Times New Roman",
            size: 24,
          }),
        ],
        spacing: { after: line.trim() === "" ? 120 : 0 },
      }),
  );

  const doc = new Document({
    sections: [{ children: paragraphs }],
  });

  return Packer.toBlob(doc);
}
