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
        // 프로필 행 보장 + 온보딩 완료 표시.
        //
        // 예전에는 auth.users 의 on_auth_user_created 트리거가 프로필을 만들어 줬고
        // 여기서는 update 만 했다. 통합 허브에서는 auth.users 가 모든 앱이 공유하는
        // 단일 테이블이라 그 트리거를 달면 다른 앱의 신규 가입 때도 resay.profiles 에
        // 행이 생긴다. 그래서 트리거를 옮기지 않고 로그인 시점에 upsert 로 만든다.
        //
        // id 외의 NOT NULL 컬럼에는 전부 기본값이 있어 id 만으로 삽입된다.
        await supabase
          .from("profiles")
          .upsert(
            { id: user.id, onboarding_completed: true },
            { onConflict: "id" }
          );
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
