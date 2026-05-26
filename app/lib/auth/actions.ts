/**
 * Auth Server Actions — login & logout
 * Runs on server only; safe for credential handling
 */
"use server";

import { compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import { createSession, deleteSession } from "@/app/lib/auth/session";
import type { LoginFormState, SessionPayload } from "@/app/lib/types/auth";

// ─── Login ────────────────────────────────────────────────────────────────────
export async function login(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  // Basic validation
  if (!username || !password) {
    return { error: "Username dan password wajib diisi." };
  }

  // Find user in DB
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) {
    return { error: "Username atau password salah." };
  }

  // Verify password
  const isValid = await compare(password, user.password);
  if (!isValid) {
    return { error: "Username atau password salah." };
  }

  // Create JWT session cookie
  const payload: SessionPayload = {
    userId: user.id,
    username: user.username,
    role: user.role as SessionPayload["role"],
    expiresAt: new Date(),
  };
  await createSession(payload);

  redirect("/");
}

// ─── Logout ───────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
