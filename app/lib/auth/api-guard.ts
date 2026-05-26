/**
 * API Auth Guard — wrap route handlers to require valid session
 * Usage: export const GET = withAuth(async (req, session) => { ... })
 */
import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/app/lib/auth/session";
import type { SessionPayload } from "@/app/lib/types/auth";

type AuthedHandler = (
  req: NextRequest,
  session: SessionPayload
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthedHandler) {
  return async function (req: NextRequest): Promise<NextResponse> {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    return handler(req, session);
  };
}
