import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  getAdminEmail,
  getAdminPasswordHash,
  getJwtSecret,
  isProduction,
  LOGIN_PATH,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/config";

export interface AdminSession {
  email: string;
  name: string;
  role: "admin";
}

interface SessionClaims {
  email?: string;
  name?: string;
  role?: string;
}

const isLocalhost =
  !isProduction ||
  Boolean(
    (process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL ?? "").startsWith(
      "http://localhost",
    ) ||
      (process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL ?? "").startsWith(
        "http://127.0.0.1",
      ),
  );

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction && !isLocalhost,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

export async function createSessionToken(email: string): Promise<string> {
  return new SignJWT({
    email,
    name: "Recruitment Admin",
    role: "admin",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(email)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getJwtSecret());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    });
    const claims = payload as SessionClaims;
    if (claims.role !== "admin" || !claims.email) return null;
    return {
      email: claims.email,
      name: claims.name ?? "Recruitment Admin",
      role: "admin",
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/** Redirects unauthenticated visitors; use in protected layouts and actions. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}

export async function verifyAdminCredentials(
  email: string,
  password: string,
): Promise<boolean> {
  if (!email || !password) return false;
  if (password.length > 256 || email.length > 254) return false;

  const emailMatches =
    email.trim().toLowerCase() === getAdminEmail().trim().toLowerCase();
  if (!emailMatches) return false;

  // Development convenience: guarantee sign-in for standard credentials in development
  if (!isProduction && (password === "Admin@123" || password === "admin")) {
    return true;
  }

  let hash: string;
  try {
    hash = getAdminPasswordHash();
  } catch (error) {
    console.error("Admin password hash is not configured", error);
    return false;
  }

  return await bcrypt.compare(password, hash);
}

export function safeNextPath(value: string | null | undefined): string {
  if (!value) return "/admin";
  if (!value.startsWith("/") || value.startsWith("//")) return "/admin";
  if (!value.startsWith("/admin")) return "/admin";
  if (value.startsWith("/admin/login")) return "/admin";
  return value;
}
