import { createReadStream, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getStoragePath } from "@/lib/server/env";
import { getDataBackend } from "@/lib/server/data-backend";
import { getFirebaseStorageBucket } from "@/lib/server/firebase-admin";
import {
  caseRootDir,
  extensionFromFilename,
  slotUploadPath,
} from "@/lib/server/case-storage";

export interface CaseBlobStorage {
  writeSlotUpload(
    caseId: string,
    slotId: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<void>;
  writeChecklistPdf(
    caseId: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<void>;
  readSlotUpload(
    caseId: string,
    slotId: string,
    uploadName: string,
  ): Promise<Buffer | undefined>;
  readChecklistPdf(
    caseId: string,
    checklistFileName?: string,
  ): Promise<Buffer | undefined>;
}

function safeFileName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, "_");
}

class LocalCaseBlobStorage implements CaseBlobStorage {
  async writeSlotUpload(
    caseId: string,
    slotId: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<void> {
    const ext = extensionFromFilename(originalName);
    mkdirSync(caseRootDir(caseId), { recursive: true });
    mkdirSync(join(caseRootDir(caseId), "uploads"), { recursive: true });
    writeFileSync(slotUploadPath(caseId, slotId, ext), buffer);
  }

  async writeChecklistPdf(
    caseId: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<void> {
    const dir = caseRootDir(caseId);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, safeFileName(fileName)), buffer);
  }

  async readSlotUpload(
    caseId: string,
    slotId: string,
    uploadName: string,
  ): Promise<Buffer | undefined> {
    const ext = extensionFromFilename(uploadName);
    const primary = slotUploadPath(caseId, slotId, ext);
    if (existsSync(primary)) {
      const { readFileSync } = await import("node:fs");
      return readFileSync(primary);
    }
    for (const tryExt of [".pdf", ".jpg", ".jpeg", ".png", ".txt"]) {
      const alt = slotUploadPath(caseId, slotId, tryExt);
      if (existsSync(alt)) {
        const { readFileSync } = await import("node:fs");
        return readFileSync(alt);
      }
    }
    return undefined;
  }

  async readChecklistPdf(
    caseId: string,
    checklistFileName?: string,
  ): Promise<Buffer | undefined> {
    const root = caseRootDir(caseId);
    if (!existsSync(root)) {
      return undefined;
    }
    let path: string | undefined;
    if (checklistFileName) {
      const direct = join(root, safeFileName(checklistFileName));
      if (existsSync(direct)) {
        path = direct;
      }
    }
    if (!path) {
      const pdfs = readdirSync(root).filter((f) =>
        f.toLowerCase().endsWith(".pdf"),
      );
      path = pdfs[0] ? join(root, pdfs[0]) : undefined;
    }
    if (!path) {
      return undefined;
    }
    const { readFileSync } = await import("node:fs");
    return readFileSync(path);
  }
}

class FirebaseCaseBlobStorage implements CaseBlobStorage {
  private objectPath(caseId: string, ...parts: string[]): string {
    return `cases/${caseId}/${parts.join("/")}`;
  }

  async writeSlotUpload(
    caseId: string,
    slotId: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<void> {
    const ext = extensionFromFilename(originalName);
    const path = this.objectPath(caseId, "uploads", `${slotId}${ext}`);
    const file = getFirebaseStorageBucket().file(path);
    await file.save(buffer, {
      resumable: false,
      metadata: { contentType: "application/octet-stream" },
    });
  }

  async writeChecklistPdf(
    caseId: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<void> {
    const path = this.objectPath(caseId, safeFileName(fileName));
    const file = getFirebaseStorageBucket().file(path);
    await file.save(buffer, {
      resumable: false,
      metadata: { contentType: "application/pdf" },
    });
  }

  private async downloadIfExists(path: string): Promise<Buffer | undefined> {
    const file = getFirebaseStorageBucket().file(path);
    const [exists] = await file.exists();
    if (!exists) {
      return undefined;
    }
    const [buf] = await file.download();
    return buf;
  }

  async readSlotUpload(
    caseId: string,
    slotId: string,
    uploadName: string,
  ): Promise<Buffer | undefined> {
    const ext = extensionFromFilename(uploadName);
    const primary = this.objectPath(caseId, "uploads", `${slotId}${ext}`);
    const found = await this.downloadIfExists(primary);
    if (found) {
      return found;
    }
    for (const tryExt of [".pdf", ".jpg", ".jpeg", ".png", ".txt"]) {
      const alt = this.objectPath(caseId, "uploads", `${slotId}${tryExt}`);
      const altBuf = await this.downloadIfExists(alt);
      if (altBuf) {
        return altBuf;
      }
    }
    return undefined;
  }

  async readChecklistPdf(
    caseId: string,
    checklistFileName?: string,
  ): Promise<Buffer | undefined> {
    if (checklistFileName) {
      const direct = this.objectPath(caseId, safeFileName(checklistFileName));
      const buf = await this.downloadIfExists(direct);
      if (buf) {
        return buf;
      }
    }
    const prefix = `cases/${caseId}/`;
    const [files] = await getFirebaseStorageBucket().getFiles({ prefix });
    const pdf = files.find(
      (f) =>
        f.name.toLowerCase().endsWith(".pdf") &&
        !f.name.includes("/uploads/"),
    );
    if (!pdf) {
      return undefined;
    }
    const [buf] = await pdf.download();
    return buf;
  }
}

let blobStorage: CaseBlobStorage | null = null;

export function getCaseBlobStorage(): CaseBlobStorage {
  if (!blobStorage) {
    blobStorage =
      getDataBackend() === "firebase"
        ? new FirebaseCaseBlobStorage()
        : new LocalCaseBlobStorage();
  }
  return blobStorage;
}

/** For zip streaming from local disk only (SQLite path). */
export function getLocalSlotUploadStreamPath(
  caseId: string,
  slotId: string,
  uploadName: string,
): string | undefined {
  const ext = extensionFromFilename(uploadName);
  const primary = slotUploadPath(caseId, slotId, ext);
  if (existsSync(primary)) {
    return primary;
  }
  for (const tryExt of [".pdf", ".jpg", ".jpeg", ".png", ".txt"]) {
    const alt = slotUploadPath(caseId, slotId, tryExt);
    if (existsSync(alt)) {
      return alt;
    }
  }
  return undefined;
}

export function getLocalChecklistStreamPath(
  caseId: string,
  checklistFileName?: string,
): string | undefined {
  const root = join(getStoragePath(), "cases", caseId);
  if (!existsSync(root)) {
    return undefined;
  }
  if (checklistFileName) {
    const direct = join(root, safeFileName(checklistFileName));
    if (existsSync(direct)) {
      return direct;
    }
  }
  const pdfs = readdirSync(root).filter((f) => f.toLowerCase().endsWith(".pdf"));
  return pdfs[0] ? join(root, pdfs[0]) : undefined;
}

export { createReadStream };
