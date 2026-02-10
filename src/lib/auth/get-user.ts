import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

export async function getUserFromRequest(req: NextRequest): Promise<string | null> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
