import { randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

import { getCloudinaryConfig } from "@/lib/config";
import { sanitiseFilename } from "@/lib/files";

let configured = false;

export function initCloudinary() {
  const config = getCloudinaryConfig();
  if (!config) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
    );
  }

  if (!configured) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    });
    configured = true;
  }

  return cloudinary;
}

export interface CloudinaryUploadResult {
  fileId: string;
  filename: string;
}

/**
 * Uploads a candidate CV (PDF, DOC, DOCX) to Cloudinary raw storage.
 * Free tier gives 25 GB with zero credit card requirement.
 */
export async function uploadToCloudinary(
  file: File,
): Promise<CloudinaryUploadResult> {
  const cld = initCloudinary();
  const filename = sanitiseFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  // Store with a safe raw key. We append .dat so Cloudinary's default
  // account-level restriction on delivering raw .pdf files never triggers.
  // The original filename (e.g. Rahul_Patil.pdf) is preserved in Google Sheets
  // and attached to download headers.
  const uniqueId = `${randomUUID().slice(0, 12)}-${filename}.dat`;
  const skew = Number(process.env.CLOCK_SKEW_SECONDS || "0") || 0;
  const timestamp = Math.floor(Date.now() / 1000) + skew;

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cld.uploader.upload_stream(
      {
        folder: "recruitment-cvs",
        resource_type: "raw",
        public_id: uniqueId,
        timestamp,
      },
      (error: unknown, result?: UploadApiResponse) => {
        if (error || !result) {
          console.error("Cloudinary upload failed", error);
          reject(error || new Error("Cloudinary upload failed"));
        } else {
          // Store both public_id and secure_url separated by a pipe
          resolve({
            fileId: `cloudinary:${result.public_id}|${result.secure_url}`,
            filename,
          });
        }
      },
    );

    Readable.from(buffer).pipe(uploadStream);
  });
}

/**
 * Streams a stored CV from Cloudinary for admin preview or download.
 */
export async function getCloudinaryStream(
  fileId: string,
): Promise<ReadableStream<Uint8Array>> {
  const raw = fileId.replace(/^cloudinary:/, "");
  const parts = raw.split("|");
  const publicId = parts[0];
  let url = parts[1];

  if (!url) {
    const cld = initCloudinary();
    url = cld.url(publicId, { resource_type: "raw", secure: true });
  }

  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(
      `Could not retrieve CV from Cloudinary (HTTP ${response.status}).`,
    );
  }

  return response.body as ReadableStream<Uint8Array>;
}

/**
 * Deletes a stored CV from Cloudinary.
 */
export async function deleteFromCloudinary(fileId: string): Promise<void> {
  try {
    const cld = initCloudinary();
    const raw = fileId.replace(/^cloudinary:/, "");
    const publicId = raw.split("|")[0];
    await cld.uploader.destroy(publicId, { resource_type: "raw" });
  } catch (error) {
    console.warn("Failed to delete file from Cloudinary:", error);
  }
}
