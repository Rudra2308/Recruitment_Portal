import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { getDataMode, getDriveFolderId } from "@/lib/config";
import { getLocalDataDir } from "@/lib/data/local-store";
import { fileExtension, sanitiseFilename } from "@/lib/files";
import { getDriveClient } from "@/lib/google/auth";

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

    // Personal Google Drives do not grant storage quota to service accounts.
    // Fall back to local persistent upload so the candidate's application is not lost.
    if (message.includes("Service Accounts do not have storage quota")) {
      console.warn(
        "[Google Drive] Personal drive detected (Service accounts require a Google Workspace Shared Drive for cloud quota). Saving CV to local upload storage.",
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
