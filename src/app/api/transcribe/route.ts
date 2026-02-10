import { NextRequest, NextResponse } from "next/server";
import { uploadAudio, transcribeAudio } from "@/lib/assemblyai";
import { supabaseAdmin } from "@/lib/supabase-server";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let buffer: Buffer | null = null;
  let fileExt = "webm";
  let audioDuration: number | null = null;

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;
    const durationStr = formData.get("duration") as string | null;
    audioDuration = durationStr ? parseInt(durationStr, 10) : null;

    if (!audioFile) {
      console.error("Transcribe: No audio file in formData");
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    buffer = Buffer.from(await audioFile.arrayBuffer());
    fileExt = audioFile.name.split(".").pop() || "webm";
    console.log(`Transcribe: file=${audioFile.name}, type=${audioFile.type}, size=${buffer.length}`);

    if (buffer.length === 0) {
      console.error("Transcribe: Empty buffer");
      return NextResponse.json(
        { error: "Empty audio recording" },
        { status: 400 }
      );
    }

    const audioUrl = await uploadAudio(buffer);
    const result = await transcribeAudio(audioUrl);

    if (!result.transcript.trim()) {
      console.error("Transcribe: Empty transcript from AssemblyAI");
      return NextResponse.json(
        { error: "Could not recognize speech" },
        { status: 400 }
      );
    }

    // Upload audio to Supabase Storage for playback
    await supabaseAdmin.storage
      .createBucket("recordings", { public: false })
      .catch(() => {});

    // Use a temp ID for storage path; will be updated after session creation
    const tempId = crypto.randomUUID();
    const storagePath = `${tempId}.${fileExt}`;
    await supabaseAdmin.storage
      .from("recordings")
      .upload(storagePath, new Uint8Array(buffer), {
        contentType: `audio/${fileExt}`,
        upsert: true,
      });

    return NextResponse.json({
      transcript: result.transcript,
      utterances: result.utterances,
      speakers: result.speakers,
      audioUrl: storagePath,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Transcribe error:", message);

    let sessionId: string | undefined;
    if (buffer && buffer.length > 0) {
      try {
        sessionId = await saveFailedSession(buffer, fileExt, audioDuration);
      } catch (saveErr) {
        console.error("Failed to save failed session:", saveErr);
      }
    }

    return NextResponse.json(
      { error: `Transcription failed: ${message}`, sessionId },
      { status: 500 }
    );
  }
}

async function saveFailedSession(
  buffer: Buffer,
  ext: string,
  duration: number | null
): Promise<string> {
  const { data: session, error: sessionError } = await supabaseAdmin
    .from("sessions")
    .insert({
      transcript: "",
      status: "transcription_failed",
      feedback_count: 0,
      duration: duration || null,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    throw new Error("Failed to create session");
  }

  // Upload audio to Supabase Storage
  await supabaseAdmin.storage
    .createBucket("recordings", { public: false })
    .catch(() => { });

  const storagePath = `${session.id}.${ext}`;
  const { error: uploadError } = await supabaseAdmin.storage
    .from("recordings")
    .upload(storagePath, new Uint8Array(buffer), {
      contentType: `audio/${ext}`,
      upsert: true,
    });

  if (uploadError) {
    console.error("Storage upload error:", uploadError);
  } else {
    await supabaseAdmin
      .from("sessions")
      .update({ audio_url: storagePath })
      .eq("id", session.id);
  }

  return session.id;
}
