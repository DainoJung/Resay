import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateFeedback } from "@/lib/gemini";
import { Utterance } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { transcript, utterances, mySpeaker, audioUrl, lang } = (await req.json()) as {
      transcript: string;
      utterances: Utterance[];
      mySpeaker: string;
      audioUrl?: string;
      lang?: string;
    };

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    // Filter to only my utterances for feedback
    const myUtterances = utterances.filter((u) => u.speaker === mySpeaker);
    const myText = myUtterances.map((u) => u.text).join("\n");

    // Generate feedback only for my speech
    const feedbackItems = await generateFeedback(myText, lang || "ko");

    // Save session to Supabase
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .insert({
        transcript,
        audio_url: audioUrl || null,
        feedback_count: feedbackItems.length,
        utterances: JSON.stringify(utterances),
        my_speaker: mySpeaker,
      })
      .select("id")
      .single();

    if (sessionError) {
      console.error("Session save error:", sessionError);
      return NextResponse.json(
        { error: "Failed to save session" },
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
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
