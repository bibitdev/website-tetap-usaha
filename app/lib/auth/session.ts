/**
 * Session management using Jose (JWT) + Next.js cookies
 * Edge Runtime compatible — no Node.js crypto dependency
 */
import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionPayload } from "@/app/lib/types/auth";

const SESSION_COOKIE = "tu-session";
const SESSION_DURATION_DAYS = 7;

function getEncodedKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

// ─── Encrypt → JWT string ─────────────────────────────────────────────────────
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_DAYS}d`)
    .sign(getEncodedKey());
}

// ─── Decrypt → payload ────────────────────────────────────────────────────────
export async function decrypt(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getEncodedKey(), {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ─── Create session cookie ────────────────────────────────────────────────────
export async function createSession(payload: SessionPayload): Promise<void> {
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );
  const token = await encrypt({ ...payload, expiresAt });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

// ─── Get current session ──────────────────────────────────────────────────────
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return decrypt(token);
}

// ─── Delete session (logout) ──────────────────────────────────────────────────
export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

// ─── Update / refresh session expiry ─────────────────────────────────────────
export async function refreshSession(): Promise<void> {
  const session = await getSession();
  if (!session) return;
  await createSession(session);
}
