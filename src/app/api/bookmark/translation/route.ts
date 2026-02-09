import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("feedbacks")
    .select("translation")
    .eq("id", id)
    .single();

  return NextResponse.json({ translation: data?.translation || null });
}
