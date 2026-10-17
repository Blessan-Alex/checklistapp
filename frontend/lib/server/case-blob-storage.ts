import { createReadStream, existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { del, get, list, put } from "@vercel/blob";
import { getStoragePath } from "@/lib/server/env";
import { getDataBackend } from "@/lib/server/data-backend";
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
  deleteAllCaseFiles(caseId: string): Promise<void>;
}

function safeFileName(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, "_");
}

/** Vercel Blob (private store) — used on Vercel when BLOB_READ_WRITE_TOKEN is set. */
export function usesRemoteCaseBlobStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
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

  async deleteAllCaseFiles(caseId: string): Promise<void> {
    const root = caseRootDir(caseId);
    if (!existsSync(root)) {
      return;
    }
    const { rmSync } = await import("node:fs");
    rmSync(root, { recursive: true, force: true });
  }
}

class VercelCaseBlobStorage implements CaseBlobStorage {
  private objectPath(caseId: string, ...parts: string[]): string {
    return `cases/${caseId}/${parts.join("/")}`;
  }

  private async downloadIfExists(pathname: string): Promise<Buffer | undefined> {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode !== 200 || !result.stream) {
      return undefined;
    }
    const arrayBuffer = await new Response(result.stream).arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async writeSlotUpload(
    caseId: string,
    slotId: string,
    originalName: string,
    buffer: Buffer,
  ): Promise<void> {
    const ext = extensionFromFilename(originalName);
    const pathname = this.objectPath(caseId, "uploads", `${slotId}${ext}`);
    await put(pathname, buffer, {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/octet-stream",
    });
  }

  async writeChecklistPdf(
    caseId: string,
    fileName: string,
    buffer: Buffer,
  ): Promise<void> {
    const pathname = this.objectPath(caseId, safeFileName(fileName));
    await put(pathname, buffer, {
      access: "private",
      addRandomSuffix: false,
      contentType: "application/pdf",
    });
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
    const { blobs } = await list({ prefix, mode: "folded" });
    const pdf = blobs.find(
      (b) =>
        b.pathname.toLowerCase().endsWith(".pdf") &&
        !b.pathname.includes("/uploads/"),
    );
    if (!pdf) {
      return undefined;
    }
    return this.downloadIfExists(pdf.pathname);
  }

  async deleteAllCaseFiles(caseId: string): Promise<void> {
    const prefix = `cases/${caseId}/`;
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor });
      if (page.blobs.length > 0) {
        await del(page.blobs.map((blob) => blob.url));
      }
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }
}

let blobStorage: CaseBlobStorage | null = null;

export function getCaseBlobStorage(): CaseBlobStorage {
  if (!blobStorage) {
    if (usesRemoteCaseBlobStorage()) {
      blobStorage = new VercelCaseBlobStorage();
    } else if (getDataBackend() === "firebase") {
      throw new Error(
        "File storage is not configured: connect a Vercel Blob store to this project (BLOB_READ_WRITE_TOKEN). Firestore alone cannot store PDFs.",
      );
    } else {
      blobStorage = new LocalCaseBlobStorage();
    }
  }
  return blobStorage;
}

/** Remove all checklist and upload files for a case from Blob or local disk. */
export async function deleteCaseBlobStorage(caseId: string): Promise<void> {
  if (usesRemoteCaseBlobStorage()) {
    await getCaseBlobStorage().deleteAllCaseFiles(caseId);
    return;
  }
  if (getDataBackend() === "firebase") {
    return;
  }
  await new LocalCaseBlobStorage().deleteAllCaseFiles(caseId);
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
