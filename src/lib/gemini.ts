import { GoogleGenAI } from "@google/genai";
import { GeminiFeedbackItem, GeminiExpressionItem } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const explanationLanguage: Record<string, string> = {
  ko: "IN KOREAN (한국어로 설명)",
  ja: "IN JAPANESE (日本語で説明)",
};

function getSystemPrompt(lang: string): string {
  const langInstruction = explanationLanguage[lang] || explanationLanguage.ko;

  return `You are an English language coach.

Given a transcript of someone speaking English, provide feedback for EVERY sentence the speaker said — both correct and incorrect ones.

For each sentence, provide:
- "original": the original sentence from the transcript
- "paraphrase": a more natural or alternative way to say it
- "explanation": ${langInstruction}
- "category": one of "grammar", "vocabulary", "expression", "pronunciation", "perfect"

Category rules:
- Use "grammar", "vocabulary", "expression", or "pronunciation" for sentences that have issues. Explain what was wrong and why the paraphrase is better.
- Use "perfect" for sentences that are already correct and natural. Give a brief compliment and suggest an alternative expression the speaker could also use.

Respond with ONLY a JSON array. No markdown, no code blocks, no extra text.
You MUST include feedback for every sentence — never skip any.

Example response:
[
  {
    "original": "I have been to there yesterday",
    "paraphrase": "I went there yesterday",
    "explanation": "${lang === "ja" ? "現在完了形(have been)は「yesterday」のような特定の過去の時点と一緒に使えません。過去形(went)を使う必要があります。" : "현재완료(have been)는 'yesterday'와 같은 특정 과거 시점과 함께 사용할 수 없습니다. 과거형(went)을 사용해야 합니다."}",
    "category": "grammar"
  },
  {
    "original": "That sounds great",
    "paraphrase": "That sounds awesome",
    "explanation": "${lang === "ja" ? "完璧な文です！「awesome」や「fantastic」なども同じ場面で使えます。" : "완벽한 문장이에요! 'awesome'이나 'fantastic' 같은 표현도 같은 상황에서 쓸 수 있어요."}",
    "category": "perfect"
  }
]`;
}

export async function generateFeedback(transcript: string, lang: string = "ko"): Promise<GeminiFeedbackItem[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Please review this English transcript and provide feedback:\n\n"${transcript}"` }],
      },
    ],
    config: {
      systemInstruction: getSystemPrompt(lang),
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

function getExpressionsPrompt(lang: string): string {
  const langInstruction = explanationLanguage[lang] || explanationLanguage.ko;

  return `You are an English language coach.

Given a transcript of someone speaking English, suggest 3-5 useful native expressions that are relevant to the conversation topic.
These should be expressions the speaker could have used or would benefit from learning.

For each expression, provide:
- "keyword": the expression itself (e.g., "come in handy")
- "meaning": a brief meaning ${langInstruction}
- "example": an example sentence using the expression
- "highlight_word": the part of the example to highlight (usually the expression itself)

Respond with ONLY a JSON array. No markdown, no code blocks, no extra text.

Example response:
[
  {
    "keyword": "come in handy",
    "meaning": "${lang === "ja" ? "役に立つ" : "유용하게 쓰이다"}",
    "example": "This tool will come in handy when you need to fix things.",
    "highlight_word": "come in handy"
  }
]`;
}

export async function generateExpressions(transcript: string, lang: string = "ko"): Promise<GeminiExpressionItem[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Based on this English conversation, suggest useful native expressions:\n\n"${transcript}"` }],
      },
    ],
    config: {
      systemInstruction: getExpressionsPrompt(lang),
      temperature: 0.5,
    },
  });

  const text = response.text?.trim() || "[]";
  const cleaned = text
    .replace(/^```json?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) return [];
    return parsed as GeminiExpressionItem[];
  } catch {
    console.error("Failed to parse expressions response:", text);
    return [];
  }
}

export async function generateTitle(transcript: string, lang: string = "ko"): Promise<string> {
  const langMap: Record<string, string> = {
    ko: "한국어",
    ja: "日本語",
  };
  const targetLang = langMap[lang] || langMap.ko;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Summarize the topic of this English conversation in a short title (max 30 characters) in ${targetLang}. Respond with ONLY the title text, nothing else.\n\n"${transcript}"` }],
      },
    ],
    config: {
      temperature: 0.3,
    },
  });

  return response.text?.trim().slice(0, 30) || "";
}
