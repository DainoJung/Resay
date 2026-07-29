import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // 통합 허브에서 이 앱의 테이블은 resay 스키마에 있다.
      // 여기서는 auth 조회만 하지만, 클라이언트 생성 지점을 전부 통일해 둔다.
      db: { schema: "resay" },
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // API routes don't need to set cookies
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}
