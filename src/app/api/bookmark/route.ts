import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateTranslation } from "@/lib/gemini";

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

    // When saving a feedback sentence, generate translation
    if (table === "feedbacks" && saved) {
      const { data: feedback } = await supabaseAdmin
        .from("feedbacks")
        .select("paraphrase")
        .eq("id", id)
        .single();

      if (feedback) {
        const translation = await generateTranslation(feedback.paraphrase, lang || "ko");

        const { error } = await supabaseAdmin
          .from("feedbacks")
          .update({ saved, translation })
          .eq("id", id);

        if (error) {
          console.error("Bookmark update error:", error);
          return NextResponse.json({ error: "Failed to update" }, { status: 500 });
        }

        return NextResponse.json({ success: true, translation });
      }
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
