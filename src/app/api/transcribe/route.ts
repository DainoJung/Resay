import { NextRequest, NextResponse } from "next/server";
import { uploadAudio, transcribeAudio } from "@/lib/assemblyai";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await audioFile.arrayBuffer());

    // Upload to AssemblyAI
    const audioUrl = await uploadAudio(buffer);

    // Transcribe
    const transcript = await transcribeAudio(audioUrl);

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "음성을 인식하지 못했습니다. 다시 시도해 주세요." },
        { status: 400 }
      );
    }

    return NextResponse.json({ transcript, audioUrl });
  } catch (error) {
    console.error("Transcribe error:", error);
    return NextResponse.json(
      { error: "음성 변환에 실패했습니다. 다시 시도해 주세요." },
      { status: 500 }
    );
  }
}
