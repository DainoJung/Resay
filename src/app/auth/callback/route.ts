import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server-auth";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const redirectUrl = req.nextUrl.clone();

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if onboarding is completed
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile?.onboarding_completed) {
          redirectUrl.pathname = "/onboarding";
          redirectUrl.search = "";
          return NextResponse.redirect(redirectUrl);
        }
      }

      redirectUrl.pathname = "/";
      redirectUrl.search = "";
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Auth error - redirect to onboarding
  redirectUrl.pathname = "/onboarding";
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}
