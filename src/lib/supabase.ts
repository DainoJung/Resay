import { createBrowserClient } from "@supabase/ssr";

// DB 가 전용 프로젝트에서 통합 허브로 옮겨가면서 이 앱의 테이블은 public 이 아니라
// resay 스키마에 있다. 지정하지 않으면 허브의 다른 앱 테이블(public)로 질의가 새어 나간다.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { db: { schema: "resay" } }
);
