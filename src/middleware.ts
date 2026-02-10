import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase-middleware";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/onboarding"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and API routes
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/fonts/") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json"
  ) {
    // Still refresh session for auth callback
    if (pathname.startsWith("/auth/callback")) {
      const { response } = createSupabaseMiddlewareClient(req);
      return response;
    }
    return NextResponse.next();
  }

  const { supabase, response } = createSupabaseMiddlewareClient(req);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const onboardingUrl = req.nextUrl.clone();
    onboardingUrl.pathname = "/onboarding";
    return NextResponse.redirect(onboardingUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icons/).*)"],
};
