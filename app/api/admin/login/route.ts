import { NextResponse } from "next/server";

import {
  createSessionToken,
  safeNextPath,
  sessionCookieOptions,
  verifyAdminCredentials,
} from "@/lib/auth";
import { SESSION_COOKIE } from "@/lib/config";
import { isSameOrigin, jsonError } from "@/lib/http";
import { getClientIp, limitLogin } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return jsonError("This request could not be verified.", 403);
  }

  const ip = getClientIp(request);
  const limit = limitLogin(ip);
  if (!limit.ok) {
    return jsonError(
      "Too many sign-in attempts. Please wait before trying again.",
      429,
      { retryAfter: limit.retryAfterSeconds },
    );
  }

  let body: { email?: unknown; password?: unknown; next?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return jsonError("Enter your email and password.", 400);
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const next = safeNextPath(typeof body.next === "string" ? body.next : null);

  if (!email || !password) {
    return jsonError("Enter your email and password.", 400);
  }

  const valid = await verifyAdminCredentials(email, password);
  if (!valid) {
    return jsonError("Invalid email or password.", 401);
  }

  const token = await createSessionToken(email.toLowerCase());
  const response = NextResponse.json({ ok: true, redirect: next });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
