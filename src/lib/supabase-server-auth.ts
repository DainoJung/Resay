import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Next 15 부터 cookies() 가 Promise 를 반환하므로 이 팩토리도 async 가 되었다.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // 통합 허브에서 이 앱의 테이블은 resay 스키마에 있다.
      db: { schema: "resay" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
