/**
 * Server-side environment configuration.
 *
 * Nothing in this module is imported by client components; Google credentials,
 * SMTP passwords and the JWT secret never cross the server boundary.
 */

import { parseBool } from "@/lib/utils";

const DEV_JWT_SECRET =
  "malati-group-recruitment-local-development-secret-do-not-use-in-production";

/**
 * bcrypt hash for the local development password `Admin@123`.
 * Only used when ADMIN_PASSWORD_HASH is not configured and NODE_ENV is not
 * production. Run `npm run hash-password -- "your-password"` for real values.
 */
const DEV_ADMIN_PASSWORD_HASH =
  "$2b$12$Ee2lA7o5VlCI6cdRf/MNi..H3xTfMV9dnBbHAPNFflLSS8zsjKruC";

export const APP_NAME = "Malati Group";
export const SESSION_COOKIE = "malati_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours
export const LOGIN_PATH = "/admin/login";

export const isProduction = process.env.NODE_ENV === "production";

export function getSpreadsheetId(): string {
  return (process.env.GOOGLE_SPREADSHEET_ID ?? "").trim();
}

export function getDriveFolderId(): string {
  return (process.env.GOOGLE_DRIVE_FOLDER_ID ?? "").trim();
}

export interface ServiceAccountCredentials {
  client_email: string;
  private_key: string;
  [key: string]: unknown;
}

let credentialsCache: ServiceAccountCredentials | null | undefined;

/** Parses either a raw JSON key or a base64-encoded JSON key. */
export function getServiceAccountCredentials(): ServiceAccountCredentials | null {
  if (credentialsCache !== undefined) return credentialsCache;

  const raw = (process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "").trim();
  if (!raw) {
    credentialsCache = null;
    return null;
  }

  try {
    const json = raw.startsWith("{")
      ? raw
      : Buffer.from(raw, "base64").toString("utf8");
    const parsed = JSON.parse(json) as ServiceAccountCredentials;
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error("client_email and private_key are required");
    }
    // Vercel / dotenv often stores newlines escaped.
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    credentialsCache = parsed;
    return parsed;
  } catch (error) {
    credentialsCache = null;
    throw new Error(
      `GOOGLE_SERVICE_ACCOUNT_KEY could not be parsed: ${
        error instanceof Error ? error.message : "invalid value"
      }`,
    );
  }
}

export type DataMode = "google" | "local";

/**
 * Google Sheets is the production store. A local JSON store keeps the portal
 * runnable for development and previews when no credentials are configured.
 * Production refuses to silently fall back to ephemeral local data.
 */
export function getDataMode(): DataMode {
  const spreadsheetId = getSpreadsheetId();
  const hasKey = Boolean((process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "").trim());

  if (spreadsheetId && hasKey) return "google";
  if (spreadsheetId || hasKey) {
    throw new Error(
      "Incomplete Google configuration: set both GOOGLE_SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_KEY.",
    );
  }

  const allowLocal =
    !isProduction || parseBool(process.env.ALLOW_LOCAL_DATA, false);
  if (!allowLocal) {
    throw new Error(
      "Google Sheets is not configured. Set GOOGLE_SPREADSHEET_ID and GOOGLE_SERVICE_ACCOUNT_KEY for production, or ALLOW_LOCAL_DATA=true for a local demo.",
    );
  }
  return "local";
}

export function isGoogleMode(): boolean {
  try {
    return getDataMode() === "google";
  } catch {
    return false;
  }
}

export function getJwtSecret(): Uint8Array {
  const secret = (process.env.JWT_SECRET ?? "").trim();
  if (secret.length >= 32) return new TextEncoder().encode(secret);
  if (isProduction) {
    throw new Error(
      "JWT_SECRET must be set to a strong value of at least 32 characters in production.",
    );
  }
  return new TextEncoder().encode(DEV_JWT_SECRET);
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "admin@malatigroup.com").trim().toLowerCase();
}

export function getAdminPasswordHash(): string {
  const hash = (process.env.ADMIN_PASSWORD_HASH ?? "").trim();
  if (hash) return hash;
  if (isProduction) {
    throw new Error(
      "ADMIN_PASSWORD_HASH is not configured. Run npm run hash-password and set it in the environment.",
    );
  }
  return DEV_ADMIN_PASSWORD_HASH;
}

export function isUsingDevAdminCredentials(): boolean {
  return !(process.env.ADMIN_PASSWORD_HASH ?? "").trim() && !isProduction;
}

export function getBaseUrl(): string {
  const configured = (
    process.env.NEXT_PUBLIC_BASE_URL ??
    process.env.BASE_URL ??
    ""
  ).trim();
  if (configured) return configured.replace(/\/+$/, "");
  const vercel = (
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    ""
  ).trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

export function absoluteUrl(path = "/"): string {
  const base = getBaseUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export const CV_ALLOWED = [
  {
    extension: ".pdf",
    mime: "application/pdf",
    label: "PDF",
  },
  {
    extension: ".doc",
    mime: "application/msword",
    label: "DOC",
  },
  {
    extension: ".docx",
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "DOCX",
  },
] as const;

export function getCvMaxBytes(): number {
  const mb = Number(process.env.CV_MAX_MB ?? "4");
  const safe = Number.isFinite(mb) && mb > 0 && mb <= 10 ? mb : 4;
  return Math.round(safe * 1024 * 1024);
}

export function getCvAcceptAttribute(): string {
  return [...CV_ALLOWED.map((entry) => entry.extension), ...CV_ALLOWED.map((entry) => entry.mime)].join(",");
}

export type SmtpConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
};

export function getEmailConfig(): SmtpConfig | null {
  const enabled = parseBool(process.env.EMAIL_ENABLED, false);
  const host = (process.env.SMTP_HOST ?? "").trim();
  const user = (process.env.SMTP_USER ?? "").trim();
  const password = process.env.SMTP_PASSWORD ?? "";

  if (!enabled || !host || !user || !password) return null;

  const port = Number(process.env.SMTP_PORT ?? "587");
  return {
    host,
    port: Number.isFinite(port) ? port : 587,
    user,
    password,
    from:
      (process.env.SMTP_FROM ?? "").trim() ||
      `Malati Group Careers <${user}>`,
  };
}

export function isEmailEnabled(): boolean {
  return getEmailConfig() !== null;
}

export function getHrEmail(): string {
  return (
    (process.env.HR_EMAIL ?? "").trim() ||
    (process.env.ADMIN_EMAIL ?? "").trim() ||
    "hrandadmin@malatigroup.com"
  );
}

export function getContactDefaults() {
  return {
    company_name: APP_NAME,
    contact_email: "hrandadmin@malatigroup.com",
    contact_phone: "+91 91 68 66 32 36",
    portal_location: "Hatkanangale, Kolhapur",
  };
}
