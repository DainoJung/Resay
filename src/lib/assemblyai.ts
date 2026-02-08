import { Utterance } from "@/types";

const API_KEY = process.env.ASSEMBLYAI_API_KEY!;
const BASE_URL = "https://api.assemblyai.com/v2";

export interface TranscribeResult {
  transcript: string;
  utterances: Utterance[];
  speakers: string[];
}

export async function uploadAudio(buffer: Buffer): Promise<string> {
  const body = buffer as unknown as BodyInit;

  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      authorization: API_KEY,
      "content-type": "application/octet-stream",
    },
    body,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error("AssemblyAI upload error body:", errorBody);
    throw new Error(`Upload failed: ${res.status} - ${errorBody}`);
  }

  const data = await res.json();
  return data.upload_url;
}

export async function transcribeAudio(audioUrl: string): Promise<TranscribeResult> {
  const createRes = await fetch(`${BASE_URL}/transcript`, {
    method: "POST",
    headers: {
      authorization: API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_detection: true,
      speaker_labels: true,
      speech_models: ["universal-3-pro", "universal-2"],
    }),
  });

  if (!createRes.ok) {
    const errorBody = await createRes.text();
    console.error("AssemblyAI transcript error body:", errorBody);
    throw new Error(`Transcription request failed: ${createRes.status} - ${errorBody}`);
  }

  const { id } = await createRes.json();

  // Poll for completion
  while (true) {
    const pollRes = await fetch(`${BASE_URL}/transcript/${id}`, {
      headers: { authorization: API_KEY },
    });

    if (!pollRes.ok) {
      throw new Error(`Polling failed: ${pollRes.status}`);
    }

    const result = await pollRes.json();

    if (result.status === "completed") {
      console.log("Speaker labels result:", JSON.stringify(result.utterances?.map((u: { speaker: string; text: string }) => ({ speaker: u.speaker, text: u.text.slice(0, 40) })), null, 2));
      const utterances: Utterance[] = (result.utterances || []).map(
        (u: { speaker: string; text: string }) => ({
          speaker: u.speaker,
          text: u.text,
        })
      );

      const speakers = Array.from(new Set(utterances.map((u) => u.speaker)));

      return {
        transcript: result.text || "",
        utterances,
        speakers,
      };
    }

    if (result.status === "error") {
      throw new Error(`Transcription error: ${result.error}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
