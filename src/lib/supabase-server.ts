import { createClient } from "@supabase/supabase-js";

// 통합 허브에서 이 앱의 테이블은 resay 스키마에 있다. (스토리지 접근에는 영향 없음)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "resay" } }
);
