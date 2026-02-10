import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getUserFromRequest } from "@/lib/auth/get-user";

export async function GET(req: NextRequest) {
  const userId = await getUserFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("feedbacks")
    .select("translation, user_id")
    .eq("id", id)
    .single();

  if (!data || data.user_id !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ translation: data?.translation || null });
}
