import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/config";
import { isSameOrigin } from "@/lib/http";
import { LOGIN_PATH } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url), 303);
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
