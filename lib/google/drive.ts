import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import {
  getDataMode,
  getDriveFolderId,
  isCloudinaryConfigured,
  isR2Configured,
} from "@/lib/config";
import { getLocalDataDir } from "@/lib/data/local-store";
import { fileExtension, sanitiseFilename } from "@/lib/files";
import { getDriveClient } from "@/lib/google/auth";
import {
  deleteFromCloudinary,
  getCloudinaryStream,
  uploadToCloudinary,
} from "@/lib/storage/cloudinary";
import { deleteFromR2, getR2Stream, uploadToR2 } from "@/lib/storage/r2";

function localUploadDirectory(): string {
  return path.join(getLocalDataDir(), "uploads");
}

function safeStoredName(fileId: string): string {
  return path.basename(fileId).replace(/[^\w.\-]/g, "_");
}

export interface UploadedCv {
  fileId: string;
  filename: string;
}

/**
 * Stores a CV privately. Google Drive files are owned by the service account
 * with no public permission; local development files live under .data/uploads.
 */
export async function uploadCv(file: File): Promise<UploadedCv> {
  // Cloudinary: 25 GB free storage, zero credit card requirement.
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file);
  }

  // Cloudflare R2: S3-compatible object storage.
  if (isR2Configured()) {
    return uploadToR2(file);
  }

  const filename = sanitiseFilename(file.name);
  const mode = getDataMode();

  if (mode === "local") {
    const directory = localUploadDirectory();
    await mkdir(directory, { recursive: true });
    const storedName = `${randomUUID()}${fileExtension(filename)}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(directory, storedName), buffer);
    return { fileId: storedName, filename };
  }

  const folderId = getDriveFolderId();
  if (!folderId) {
    throw new Error(
      "GOOGLE_DRIVE_FOLDER_ID is not configured; CV storage is unavailable.",
    );
  }
  const buffer = Buffer.from(await file.arrayBuffer());

  // If a Google Apps Script Web App URL is configured, route upload through it.
  // This bypasses personal @gmail.com Drive quota restrictions for Service Accounts.
  const appsScriptUrl = (process.env.GOOGLE_APPS_SCRIPT_URL ?? "").trim();
  if (appsScriptUrl) {
    try {
      const base64 = buffer.toString("base64");
      const res = await fetch(appsScriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          mimeType: file.type || "application/pdf",
          folderId,
          base64,
        }),
        redirect: "follow",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        fileId?: string;
        filename?: string;
        error?: string;
      };
      if (data.ok && data.fileId) {
        return { fileId: data.fileId, filename: data.filename || filename };
      }
      console.warn(
        "[Google Drive] Apps Script webhook error, trying direct API:",
        data.error,
      );
    } catch (webhookError) {
      console.warn(
        "[Google Drive] Apps Script webhook failed, trying direct API:",
        webhookError,
      );
    }
  }

  const drive = getDriveClient();

  try {
    const response = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [folderId],
        mimeType: file.type || "application/octet-stream",
      },
      media: {
        mimeType: file.type || "application/octet-stream",
        body: Readable.from(buffer),
      },
      fields: "id",
      supportsAllDrives: true,
    });

    const fileId = response.data.id;
    if (!fileId) throw new Error("Google Drive did not return a file id.");
    return { fileId, filename };
  } catch (error: unknown) {
    const message =
      (error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : "") ||
      (error && typeof error === "object" && "cause" in error
        ? String(((error as { cause: { message?: unknown } }).cause)?.message)
        : "");

    const isQuotaOrPermError =
      message.includes("Service Accounts do not have storage quota") ||
      message.includes("storage quota") ||
      message.includes("insufficient permissions") ||
      message.includes("The caller does not have permission") ||
      message.includes("File not found") ||
      message.includes("notFound");

    // Personal Google Drives do not grant storage quota to service accounts,
    // or ownership transfer / folder renames may restrict direct API upload.
    // Fall back to persistent upload storage so the candidate's application is never lost.
    if (isQuotaOrPermError) {
      console.warn(
        `[Google Drive] Direct API upload unavailable (${message}). Saving CV to local upload storage fallback.`,
      );
      const directory = localUploadDirectory();
      await mkdir(directory, { recursive: true });
      const storedName = `${randomUUID()}${fileExtension(filename)}`;
      await writeFile(path.join(directory, storedName), buffer);
      return { fileId: `local:${storedName}`, filename };
    }

    throw error;
  }
}

export async function getCvStream(
  fileId: string,
): Promise<ReadableStream<Uint8Array>> {
  if (fileId.startsWith("cloudinary:")) {
    return getCloudinaryStream(fileId);
  }

  if (fileId.startsWith("r2:")) {
    return getR2Stream(fileId);
  }

  const mode = getDataMode();

  if (mode === "local" || fileId.startsWith("local:")) {
    const rawId = fileId.replace(/^local:/, "");
    const filename = safeStoredName(rawId);
    if (!filename) throw new Error("Invalid CV reference.");
    const buffer = await readFile(path.join(localUploadDirectory(), filename));
    return Readable.toWeb(Readable.from(buffer)) as ReadableStream<Uint8Array>;
  }

  const drive = getDriveClient();
  const response = await drive.files.get(
    { fileId, alt: "media", supportsAllDrives: true },
    { responseType: "stream" },
  );
  return Readable.toWeb(
    response.data as Readable,
  ) as ReadableStream<Uint8Array>;
}

export async function deleteCv(fileId: string): Promise<void> {
  if (!fileId) return;
  if (fileId.startsWith("cloudinary:")) {
    await deleteFromCloudinary(fileId);
    return;
  }
  if (fileId.startsWith("r2:")) {
    await deleteFromR2(fileId);
    return;
  }

  const mode = getDataMode();
  try {
    if (mode === "local" || fileId.startsWith("local:")) {
      const rawId = fileId.replace(/^local:/, "");
      await unlink(path.join(localUploadDirectory(), safeStoredName(rawId)));
      return;
    }
    await getDriveClient().files.delete({ fileId, supportsAllDrives: true });
  } catch (error) {
    console.error("Failed to clean up CV file", error);
  }
}
