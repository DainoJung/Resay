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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Ensure onboarding is marked complete on login
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile?.onboarding_completed) {
          await supabase
            .from("profiles")
            .update({ onboarding_completed: true })
            .eq("id", user.id);
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
