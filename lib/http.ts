import { NextResponse } from "next/server";

/** Rejects cross-site form posts when the browser sends an Origin header. */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients and same-origin form posts
  try {
    const originUrl = new URL(origin);
    const hostHeader =
      request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
      request.headers.get("host");
    if (!hostHeader) return true;

    // Direct match
    if (originUrl.host === hostHeader) return true;

    // Normalize hostnames (strip port if needed)
    const originHostname = originUrl.hostname.toLowerCase();
    const hostName = hostHeader.split(":")[0].toLowerCase();
    if (originHostname === hostName) return true;

    // Loopback normalization for local development (localhost, 127.0.0.1, ::1)
    const isOriginLoopback =
      originHostname === "localhost" ||
      originHostname === "127.0.0.1" ||
      originHostname === "::1";
    const isHostLoopback =
      hostName === "localhost" ||
      hostName === "127.0.0.1" ||
      hostName === "::1";
    if (isOriginLoopback && isHostLoopback) return true;

    return false;
  } catch {
    return false;
  }
}

export function jsonError(
  message: string,
  status = 400,
  extra: Record<string, unknown> = {},
) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export function noStoreHeaders() {
  return {
    "Cache-Control": "no-store, max-age=0",
  };
}
