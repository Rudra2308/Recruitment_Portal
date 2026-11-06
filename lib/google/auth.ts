import { google, type Auth } from "googleapis";

import { getServiceAccountCredentials } from "@/lib/config";

let authCache: Auth.GoogleAuth | null = null;
let sheetsCache: ReturnType<typeof google.sheets> | null = null;
let driveCache: ReturnType<typeof google.drive> | null = null;

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

export function getGoogleAuth(): Auth.GoogleAuth {
  if (authCache) return authCache;
  const credentials = getServiceAccountCredentials();
  if (!credentials) {
    throw new Error("Google service account credentials are not configured.");
  }
  authCache = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  return authCache;
}

export function getSheetsClient() {
  if (sheetsCache) return sheetsCache;
  sheetsCache = google.sheets({ version: "v4", auth: getGoogleAuth() });
  return sheetsCache;
}

export function getDriveClient() {
  if (driveCache) return driveCache;
  driveCache = google.drive({ version: "v3", auth: getGoogleAuth() });
  return driveCache;
}
