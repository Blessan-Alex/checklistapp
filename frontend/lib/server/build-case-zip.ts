import { createReadStream } from "node:fs";
import { ZipArchive } from "archiver";
import type { Case } from "@/lib/types";
import {
  createReadStream as exportCreateReadStream,
  getCaseBlobStorage,
  getLocalChecklistStreamPath,
  getLocalSlotUploadStreamPath,
} from "@/lib/server/case-blob-storage";
import { getDataBackend } from "@/lib/server/data-backend";
import { getArchiveRootName, slotDocumentZipName } from "@/lib/zip-manifest";

export async function buildCaseZipBuffer(caseRecord: Case): Promise<Buffer> {
  const root = getArchiveRootName(caseRecord);
  const storage = getCaseBlobStorage();
  const useFirebase = getDataBackend() === "firebase";

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.on("data", (chunk: Buffer) => chunks.push(chunk));
    archive.on("error", reject);
    archive.on("end", () => resolve(Buffer.concat(chunks)));

    void (async () => {
      try {
        for (const slot of caseRecord.slots) {
          if (!slot.clientUpload || !slot.upload) {
            continue;
          }
          const entryName = `${root}/Documents/${slotDocumentZipName(slot)}`;
          if (useFirebase) {
            const buf = await storage.readSlotUpload(
              caseRecord.id,
              slot.id,
              slot.upload.name,
            );
            if (buf) {
              archive.append(buf, { name: entryName });
            }
          } else {
            const filePath = getLocalSlotUploadStreamPath(
              caseRecord.id,
              slot.id,
              slot.upload.name,
            );
            if (filePath) {
              archive.append(exportCreateReadStream(filePath), {
                name: entryName,
              });
            }
          }
        }

        if (useFirebase) {
          const checklistBuf = await storage.readChecklistPdf(
            caseRecord.id,
            caseRecord.checklistFileName,
          );
          if (checklistBuf) {
            const miscName =
              caseRecord.checklistFileName ?? "Submitted checklist.pdf";
            archive.append(checklistBuf, {
              name: `${root}/Misc/${miscName}`,
            });
          }
        } else {
          const checklistPath = getLocalChecklistStreamPath(
            caseRecord.id,
            caseRecord.checklistFileName,
          );
          if (checklistPath) {
            const miscName =
              caseRecord.checklistFileName ?? "Submitted checklist.pdf";
            archive.append(createReadStream(checklistPath), {
              name: `${root}/Misc/${miscName}`,
            });
          }
        }

        archive.finalize();
      } catch (error) {
        reject(error);
      }
    })();
  });
}
