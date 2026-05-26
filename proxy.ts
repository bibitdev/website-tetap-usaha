/**
 * Next.js Proxy (formerly Middleware) — route protection
 * Renamed from middleware.ts to proxy.ts in Next.js 16+
 * Runs on Edge Runtime; uses jose for JWT verification (no Node.js crypto)
 */
import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "@/app/lib/auth/session";

// Routes that require authentication
const PROTECTED_ROUTES = [
  "/",
  "/data-barang",
  "/barang-masuk",
  "/barang-keluar",
  "/riwayat",
  "/laporan",
];

// Routes that are public (no auth needed)
const PUBLIC_ROUTES = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow Next.js internals, static files, and public folder assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Decrypt session from cookie
  const sessionToken = request.cookies.get("tu-session")?.value;
  const session = await decrypt(sessionToken);
  const isAuthenticated = !!session?.userId;

  // If accessing protected route without session → redirect to login
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login while already authenticated → redirect to dashboard
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, images, etc.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
