import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { uploadAudio, transcribeAudio } from "@/lib/assemblyai";
import { generateFeedback, generateExpressions, generateTitle } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, lang, mySpeaker } = (await req.json()) as {
      sessionId: string;
      lang?: string;
      mySpeaker?: string;
    };

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const { data: session } = await supabaseAdmin
      .from("sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Case 2: Speaker selected after transcription succeeded
    if (mySpeaker && session.transcript) {
      const utterances = typeof session.utterances === "string"
        ? JSON.parse(session.utterances)
        : session.utterances || [];

      return await generateAndSaveFeedback(
        sessionId,
        session.transcript,
        utterances,
        mySpeaker,
        session.audio_url,
        session.duration,
        lang || "ko"
      );
    }

    // Case 1: Retry transcription from stored audio
    if (!session.audio_url) {
      return NextResponse.json(
        { error: "No stored audio for retry" },
        { status: 400 }
      );
    }

    // Download audio from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("recordings")
      .download(session.audio_url);

    if (downloadError || !fileData) {
      console.error("Storage download error:", downloadError);
      return NextResponse.json(
        { error: "Failed to download stored audio" },
        { status: 500 }
      );
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Upload to AssemblyAI and transcribe
    const audioUrl = await uploadAudio(buffer);
    const result = await transcribeAudio(audioUrl);

    if (!result.transcript.trim()) {
      return NextResponse.json(
        { error: "Could not recognize speech" },
        { status: 400 }
      );
    }

    // Update session with transcript data
    await supabaseAdmin
      .from("sessions")
      .update({
        transcript: result.transcript,
        utterances: JSON.stringify(result.utterances),
      })
      .eq("id", sessionId);

    // If multiple speakers, return for speaker selection
    if (result.speakers.length > 1) {
      return NextResponse.json({
        needsSpeaker: true,
        speakers: result.speakers,
        utterances: result.utterances,
        transcript: result.transcript,
      });
    }

    // Single speaker: generate feedback immediately
    const speaker = result.speakers[0] || "A";
    return await generateAndSaveFeedback(
      sessionId,
      result.transcript,
      result.utterances,
      speaker,
      audioUrl,
      session.duration,
      lang || "ko"
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Retry error:", message);
    return NextResponse.json(
      { error: `Retry failed: ${message}` },
      { status: 500 }
    );
  }
}

async function generateAndSaveFeedback(
  sessionId: string,
  transcript: string,
  utterances: { speaker: string; text: string }[],
  mySpeaker: string,
  audioUrl: string | null,
  duration: number | null,
  lang: string
) {
  const myTexts = utterances
    .filter((u) => u.speaker === mySpeaker)
    .map((u) => u.text);

  const [feedbackItems, expressionItems, title] = await Promise.all([
    generateFeedback(myTexts, lang),
    generateExpressions(transcript, lang),
    generateTitle(transcript, lang),
  ]);

  // Update session to completed
  await supabaseAdmin
    .from("sessions")
    .update({
      transcript,
      audio_url: audioUrl,
      feedback_count: feedbackItems.length,
      utterances: JSON.stringify(utterances),
      my_speaker: mySpeaker,
      title: title || null,
      duration: duration || null,
      status: "completed",
    })
    .eq("id", sessionId);

  // Save feedbacks
  if (feedbackItems.length > 0) {
    await supabaseAdmin.from("feedbacks").insert(
      feedbackItems.map((item) => ({
        session_id: sessionId,
        original: item.original,
        paraphrase: item.paraphrase,
        explanation: item.explanation,
        is_perfect: item.is_perfect ?? false,
      }))
    );
  }

  // Save expressions
  if (expressionItems.length > 0) {
    await supabaseAdmin.from("expressions").insert(
      expressionItems.map((item) => ({
        session_id: sessionId,
        keyword: item.keyword,
        meaning: item.meaning,
        example: item.example,
        highlight_word: item.highlight_word,
      }))
    );
  }

  // Clean up stored audio from Supabase Storage (best effort)
  const storagePaths = [`${sessionId}.webm`, `${sessionId}.mp4`, `${sessionId}.aac`];
  await supabaseAdmin.storage.from("recordings").remove(storagePaths).catch(() => {});

  return NextResponse.json({
    success: true,
    sessionId,
  });
}
