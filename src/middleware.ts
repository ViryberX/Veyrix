import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user, isConfigured } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Protected SaaS application routes
  const isProtectedRoute =
    pathname === "/" ||
    pathname.startsWith("/projects") ||
    pathname.startsWith("/tasks") ||
    pathname.startsWith("/analytics") ||
    pathname.startsWith("/team") ||
    pathname.startsWith("/billing") ||
    pathname.startsWith("/settings");

  // Public authentication routes
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // If Supabase is fully configured with credentials:
  if (isConfigured) {
    // 1. Unauthenticated user trying to access protected dashboard route -> redirect to login
    if (isProtectedRoute && !user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Authenticated user trying to access login/register -> redirect to dashboard
    if (isAuthRoute && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, svgs, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
