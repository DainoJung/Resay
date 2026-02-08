import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateFeedback } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { transcript, audioUrl } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    // Generate feedback from Gemini
    const feedbackItems = await generateFeedback(transcript);

    // Save session to Supabase
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .insert({
        transcript,
        audio_url: audioUrl || null,
        feedback_count: feedbackItems.length,
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("Session save error:", sessionError);
      return NextResponse.json(
        { error: "세션 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    // Save feedbacks to Supabase
    if (feedbackItems.length > 0) {
      const feedbackRows = feedbackItems.map((item) => ({
        session_id: session.id,
        original: item.original,
        paraphrase: item.paraphrase,
        explanation: item.explanation,
        category: item.category,
      }));

      const { error: feedbackError } = await supabaseAdmin
        .from("feedbacks")
        .insert(feedbackRows);

      if (feedbackError) {
        console.error("Feedback save error:", feedbackError);
      }
    }

    // Return feedbacks with generated IDs
    const { data: savedFeedbacks } = await supabaseAdmin
      .from("feedbacks")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      sessionId: session.id,
      feedbacks: savedFeedbacks || [],
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "피드백 생성에 실패했습니다. 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
