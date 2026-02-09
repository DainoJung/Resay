import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateTranslation } from "@/lib/gemini";

async function generateTranslationInBackground(id: string, lang: string) {
  try {
    const { data: feedback } = await supabaseAdmin
      .from("feedbacks")
      .select("paraphrase")
      .eq("id", id)
      .single();

    if (feedback) {
      const translation = await generateTranslation(feedback.paraphrase, lang);
      await supabaseAdmin
        .from("feedbacks")
        .update({ translation })
        .eq("id", id);
    }
  } catch (err) {
    console.error("Background translation error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { table, id, saved, lang } = (await req.json()) as {
      table: "expressions" | "feedbacks";
      id: string;
      saved: boolean;
      lang?: string;
    };

    if (!table || !id || typeof saved !== "boolean") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (table !== "expressions" && table !== "feedbacks") {
      return NextResponse.json({ error: "Invalid table" }, { status: 400 });
    }

    // Save immediately
    const { error } = await supabaseAdmin
      .from(table)
      .update({ saved })
      .eq("id", id);

    if (error) {
      console.error("Bookmark update error:", error);
      return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }

    // Generate translation in background (don't await)
    if (table === "feedbacks" && saved) {
      generateTranslationInBackground(id, lang || "ko");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bookmark error:", error);
    return NextResponse.json({ error: "Failed to update bookmark" }, { status: 500 });
  }
}
