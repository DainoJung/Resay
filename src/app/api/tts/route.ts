import { NextRequest, NextResponse } from "next/server";
import { generateTTS } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as { text: string };

    if (!text || text.length > 4000) {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const { audioData, mimeType } = await generateTTS(text);

    const buffer = Buffer.from(audioData, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}
