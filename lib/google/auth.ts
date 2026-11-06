import { google, type Auth } from "googleapis";

import { getServiceAccountCredentials } from "@/lib/config";

let isHooked = false;
function setupClockSkewHook() {
  if (isHooked) return;
  isHooked = true;

  const skew = Number(process.env.CLOCK_SKEW_SECONDS || "0") || 0;
  if (!skew) return;

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const jwsSign = require("google-auth-library/build/src/gtoken/jwsSign");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { sign } = require("jws");
    if (jwsSign && typeof jwsSign.getJwsSign === "function" && typeof sign === "function") {
      jwsSign.getJwsSign = function (tokenOptions: {
        iss: string;
        scope: string;
        sub?: string;
        key: string;
        additionalClaims?: Record<string, unknown>;
      }) {
        const iat = Math.floor(Date.now() / 1000) + skew;
        const payload = {
          iss: tokenOptions.iss,
          scope: tokenOptions.scope,
          aud: "https://oauth2.googleapis.com/token",
          exp: iat + 3600,
          iat,
          sub: tokenOptions.sub,
          ...tokenOptions.additionalClaims,
        };
        return sign({
          header: { alg: "RS256" },
          payload,
          secret: tokenOptions.key,
        });
      };
    }
  } catch (err) {
    console.warn("Could not setup Google auth clock skew hook:", err);
  }
}

let authCache: Auth.GoogleAuth | null = null;
let sheetsCache: ReturnType<typeof google.sheets> | null = null;
let driveCache: ReturnType<typeof google.drive> | null = null;

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

export function getGoogleAuth(): Auth.GoogleAuth {
  setupClockSkewHook();
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
