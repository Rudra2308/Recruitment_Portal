import { CV_ALLOWED, getCvMaxBytes } from "@/lib/config";

export interface FileValidationResult {
  ok: boolean;
  error?: string;
  extension?: string;
  mime?: string;
}

export function sanitiseFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "cv";
  const cleaned = base
    .replace(/[^\w.\-() ]+/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return cleaned || "cv";
}

export function fileExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index === -1 ? "" : name.slice(index).toLowerCase();
}

async function readSignature(file: File): Promise<Uint8Array> {
  const slice = file.slice(0, 8);
  return new Uint8Array(await slice.arrayBuffer());
}

function isPdf(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46
  );
}

function isZip(bytes: Uint8Array): boolean {
  return (
    bytes[0] === 0x50 &&
    bytes[1] === 0x4b &&
    (bytes[2] === 0x03 || bytes[2] === 0x05 || bytes[2] === 0x07) &&
    (bytes[3] === 0x04 || bytes[3] === 0x06 || bytes[3] === 0x08)
  );
}

function isOleDoc(bytes: Uint8Array): boolean {
  const signature = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
  return signature.every((byte, index) => bytes[index] === byte);
}

/**
 * Validates CV uploads by extension *and* file signature. MIME types from
 * browsers are advisory, so they are not trusted on their own.
 */
export async function validateCvFile(file: File): Promise<FileValidationResult> {
  const maxBytes = getCvMaxBytes();
  if (!file || file.size === 0) {
    return { ok: false, error: "The selected file is empty." };
  }
  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `The file is larger than ${Math.round(maxBytes / (1024 * 1024))} MB.`,
    };
  }

  const filename = sanitiseFilename(file.name);
  const extension = fileExtension(filename);
  const allowed = CV_ALLOWED.find((entry) => entry.extension === extension);
  if (!allowed) {
    return {
      ok: false,
      error: "Upload a PDF, DOC or DOCX file.",
    };
  }

  const bytes = await readSignature(file);
  const signatureMatches =
    (extension === ".pdf" && isPdf(bytes)) ||
    (extension === ".docx" && isZip(bytes)) ||
    (extension === ".doc" && (isOleDoc(bytes) || isZip(bytes)));

  if (!signatureMatches) {
    return {
      ok: false,
      error: "The file contents do not match a valid PDF, DOC or DOCX file.",
    };
  }

  return { ok: true, extension, mime: allowed.mime };
}

export function isUploadedFile(value: unknown): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "size" in value &&
    "name" in value &&
    typeof (value as File).arrayBuffer === "function"
  );
}
