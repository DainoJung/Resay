import { GoogleGenAI } from "@google/genai";
import { GeminiFeedbackItem } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_PROMPT = `You are an English language coach for Korean speakers.

Given a transcript of someone speaking English, identify sentences that could be improved.
Only provide feedback for sentences that have issues — skip sentences that are already correct or natural.

For each sentence that needs improvement, provide:
- "original": the original sentence from the transcript
- "paraphrase": a more natural or correct way to say it
- "explanation": explain what was wrong and why the paraphrase is better, IN KOREAN (한국어로 설명)
- "category": one of "grammar", "vocabulary", "expression", "pronunciation"

Respond with ONLY a JSON array. No markdown, no code blocks, no extra text.
If everything is correct and natural, respond with an empty array: []

Example response:
[
  {
    "original": "I have been to there yesterday",
    "paraphrase": "I went there yesterday",
    "explanation": "현재완료(have been)는 'yesterday'와 같은 특정 과거 시점과 함께 사용할 수 없습니다. 과거형(went)을 사용해야 합니다.",
    "category": "grammar"
  }
]`;

export async function generateFeedback(transcript: string): Promise<GeminiFeedbackItem[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Please review this English transcript and provide feedback:\n\n"${transcript}"` }],
      },
    ],
    config: {
      systemInstruction: SYSTEM_PROMPT,
      temperature: 0.3,
    },
  });

  const text = response.text?.trim() || "[]";

  // Clean up potential markdown code blocks
  const cleaned = text
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed as GeminiFeedbackItem[];
  } catch {
    console.error("Failed to parse Gemini response:", text);
    return [];
  }
}
