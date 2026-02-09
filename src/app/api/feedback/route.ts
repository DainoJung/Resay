import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateFeedback, generateExpressions, generateTitle } from "@/lib/gemini";
import { Utterance } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { transcript, utterances, mySpeaker, audioUrl, lang, duration } = (await req.json()) as {
      transcript: string;
      utterances: Utterance[];
      mySpeaker: string;
      audioUrl?: string;
      lang?: string;
      duration?: number;
    };

    if (!transcript) {
      return NextResponse.json({ error: "Transcript is required" }, { status: 400 });
    }

    // Filter to only my utterances for feedback
    const myUtterances = utterances.filter((u) => u.speaker === mySpeaker);
    const myTexts = myUtterances.map((u) => u.text);

    // Generate feedback, expressions, and title in parallel
    const userLang = lang || "ko";
    const [feedbackItems, expressionItems, title] = await Promise.all([
      generateFeedback(myTexts, userLang),
      generateExpressions(transcript, userLang),
      generateTitle(transcript, userLang),
    ]);

    // Save session to Supabase
    const { data: session, error: sessionError } = await supabaseAdmin
      .from("sessions")
      .insert({
        transcript,
        audio_url: audioUrl || null,
        feedback_count: feedbackItems.length,
        utterances: JSON.stringify(utterances),
        my_speaker: mySpeaker,
        title: title || null,
        duration: duration || null,
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
        is_perfect: item.is_perfect ?? false,
      }));

      const { error: feedbackError } = await supabaseAdmin
        .from("feedbacks")
        .insert(feedbackRows);

      if (feedbackError) {
        console.error("Feedback save error:", feedbackError);
      }
    }

    // Save expressions to Supabase
    if (expressionItems.length > 0) {
      const expressionRows = expressionItems.map((item) => ({
        session_id: session.id,
        keyword: item.keyword,
        meaning: item.meaning,
        example: item.example,
        highlight_word: item.highlight_word,
      }));

      const { error: expressionError } = await supabaseAdmin
        .from("expressions")
        .insert(expressionRows);

      if (expressionError) {
        console.error("Expression save error:", expressionError);
      }
    }

    const { data: savedFeedbacks } = await supabaseAdmin
      .from("feedbacks")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });

    const { data: savedExpressions } = await supabaseAdmin
      .from("expressions")
      .select("*")
      .eq("session_id", session.id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      sessionId: session.id,
      feedbacks: savedFeedbacks || [],
      expressions: savedExpressions || [],
      title: title || null,
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Failed to generate feedback" },
      { status: 500 }
    );
  }
}
