const API_KEY = process.env.ASSEMBLYAI_API_KEY!;
const BASE_URL = "https://api.assemblyai.com/v2";

export async function uploadAudio(audioBuffer: Buffer): Promise<string> {
  const res = await fetch(`${BASE_URL}/upload`, {
    method: "POST",
    headers: {
      authorization: API_KEY,
      "content-type": "application/octet-stream",
    },
    body: new Uint8Array(audioBuffer),
  });

  if (!res.ok) {
    throw new Error(`Upload failed: ${res.status}`);
  }

  const data = await res.json();
  return data.upload_url;
}

export async function transcribeAudio(audioUrl: string): Promise<string> {
  // Create transcription request
  const createRes = await fetch(`${BASE_URL}/transcript`, {
    method: "POST",
    headers: {
      authorization: API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      language_code: "en",
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Transcription request failed: ${createRes.status}`);
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
      return result.text || "";
    }

    if (result.status === "error") {
      throw new Error(`Transcription error: ${result.error}`);
    }

    // Wait 1 second before next poll
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
