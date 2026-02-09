import { NextRequest, NextResponse } from "next/server";
import { uploadAudio, transcribeAudio } from "@/lib/assemblyai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      console.error("Transcribe: No audio file in formData");
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());
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

    return NextResponse.json({
      transcript: result.transcript,
      utterances: result.utterances,
      speakers: result.speakers,
      audioUrl,
    });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
