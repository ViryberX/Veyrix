import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { response, user, isConfigured } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Public authentication routes
  const isAuthRoute =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password");

  // If Supabase is fully configured with credentials:
  if (isConfigured) {
    // Authenticated user trying to access login/register -> redirect to dashboard
    if (isAuthRoute && user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Allow all dashboard routes (overview, projects, tasks, analytics, team, billing, settings)
  // to be viewed freely in guest/preview mode. Users will only be prompted to log in when
  // they attempt write actions or modifications.
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
