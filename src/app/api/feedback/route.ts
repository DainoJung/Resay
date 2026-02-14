import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { generateFeedback, generateExpressions, generateTitle, generateEvaluation } from "@/lib/gemini";
import { Utterance } from "@/types";
import { getUserFromRequest } from "@/lib/auth/get-user";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    // Generate evaluation scores (after feedback so we have paraphrases)
    const originals = feedbackItems.map((item) => item.original);
    const paraphrases = feedbackItems.map((item) => item.paraphrase);
    const evaluation = await generateEvaluation(originals, paraphrases, transcript);

    let grammarScore: number | null = null;
    let vocabularyScore: number | null = null;
    let fluencyScore: number | null = null;
    let naturalnessScore: number | null = null;
    let overallScore: number | null = null;

    if (evaluation) {
      grammarScore = evaluation.grammar_score;
      vocabularyScore = evaluation.vocabulary_score;
      fluencyScore = evaluation.fluency_score;
      naturalnessScore = evaluation.naturalness_score;
      overallScore = Math.round(
        grammarScore * 0.3 + fluencyScore * 0.3 + vocabularyScore * 0.2 + naturalnessScore * 0.2
      );
    }

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
        user_id: userId,
        grammar_score: grammarScore,
        vocabulary_score: vocabularyScore,
        fluency_score: fluencyScore,
        naturalness_score: naturalnessScore,
        overall_score: overallScore,
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
        user_id: userId,
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
        user_id: userId,
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
