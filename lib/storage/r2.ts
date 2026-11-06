import { randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getR2Config } from "@/lib/config";
import { fileExtension, sanitiseFilename } from "@/lib/files";

let cachedClient: S3Client | null = null;

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;

  const config = getR2Config();
  if (!config) {
    throw new Error(
      "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.",
    );
  }

  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return cachedClient;
}

export interface R2UploadResult {
  fileId: string;
  filename: string;
}

export async function uploadToR2(file: File): Promise<R2UploadResult> {
  const config = getR2Config();
  if (!config) throw new Error("Cloudflare R2 configuration missing.");

  const client = getR2Client();
  const filename = sanitiseFilename(file.name);
  const key = `${randomUUID()}${fileExtension(filename)}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucketName,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/pdf",
    }),
  );

  return {
    fileId: `r2:${key}`,
    filename,
  };
}

export async function getR2Stream(
  fileId: string,
): Promise<ReadableStream<Uint8Array>> {
  const config = getR2Config();
  if (!config) throw new Error("Cloudflare R2 configuration missing.");

  const client = getR2Client();
  const key = fileId.replace(/^r2:/, "");

  const response = await client.send(
    new GetObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );

  if (!response.Body) {
    throw new Error("Cloudflare R2 returned an empty body.");
  }

  // SdkStream in aws-sdk v3 provides transformToWebStream()
  if (typeof (response.Body as { transformToWebStream?: unknown }).transformToWebStream === "function") {
    return (response.Body as { transformToWebStream: () => ReadableStream<Uint8Array> }).transformToWebStream();
  }

  // Fallback if transformToWebStream is missing
  const { Readable } = await import("node:stream");
  return Readable.toWeb(response.Body as unknown as import("node:stream").Readable) as ReadableStream<Uint8Array>;
}

export async function deleteFromR2(fileId: string): Promise<void> {
  const config = getR2Config();
  if (!config) return;

  const client = getR2Client();
  const key = fileId.replace(/^r2:/, "");

  await client.send(
    new DeleteObjectCommand({
      Bucket: config.bucketName,
      Key: key,
    }),
  );
}
