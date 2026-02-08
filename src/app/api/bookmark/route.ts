import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  try {
    const { table, id, saved } = (await req.json()) as {
      table: "expressions" | "feedbacks";
      id: string;
      saved: boolean;
    };

    if (!table || !id || typeof saved !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (table !== "expressions" && table !== "feedbacks") {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from(table)
      .update({ saved })
      .eq("id", id);

    if (error) {
      console.error("Bookmark update error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
