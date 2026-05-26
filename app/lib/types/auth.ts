/** Auth-related TypeScript types for Tetap Usaha */

export type UserRole = "admin" | "staff";

export interface SessionPayload {
  userId: string;
  username: string;
  role: UserRole;
  expiresAt: Date;
}

export interface LoginFormState {
  error?: string;
  success?: boolean;
}

export interface SafeUser {
  id: string;
  username: string;
  role: UserRole;
}
