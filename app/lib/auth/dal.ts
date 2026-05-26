/**
 * Data Access Layer (DAL) — centralized auth verification
 * All protected server components & route handlers call verifySession()
 */
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/app/lib/auth/session";
import type { SessionPayload } from "@/app/lib/types/auth";

// Memoized per request — avoids duplicate cookie reads on the same render pass
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  return session;
});

// Returns null instead of redirecting — use in components that need optional auth info
export const getOptionalSession = cache(
  async (): Promise<SessionPayload | null> => {
    return getSession();
  }
);
