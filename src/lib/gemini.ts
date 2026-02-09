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

You will receive a list of utterances (separated by "---") from someone speaking English.
For EACH utterance, provide exactly ONE overall feedback.

For each utterance, provide:
- "original": the full original utterance text (copy it exactly)
- "paraphrase": a more natural or improved way to say the whole utterance
- "explanation": ${langInstruction}
- "is_perfect": true if the utterance is already natural and correct, false if it needs improvement

If is_perfect is false, give a CONCISE explanation (2-3 sentences): what's wrong and how the paraphrase fixes it.
If is_perfect is true, keep the explanation SHORT (1 sentence): a brief compliment or one alternative expression.

Respond with ONLY a JSON array. No markdown, no code blocks, no extra text.
You MUST return exactly one item per utterance.

Example response:
[
  {
    "original": "I have been to there yesterday. Can you help me?",
    "paraphrase": "I went there yesterday. Could you help me?",
    "explanation": "${lang === "ja" ? "「have been」は「yesterday」と一緒に使えません。過去形「went」が正しいです。また「Could you」の方が「Can you」より丁寧です。" : "'have been'은 'yesterday'와 함께 쓸 수 없어요. 과거형 'went'가 맞습니다. 또한 'Could you'가 'Can you'보다 더 공손한 표현이에요."}",
    "is_perfect": false
  },
  {
    "original": "That sounds great, thank you!",
    "paraphrase": "That sounds wonderful, thanks a lot!",
    "explanation": "${lang === "ja" ? "完璧です！「That sounds wonderful」も自然です。" : "완벽해요! 'That sounds wonderful'도 자연스러워요."}",
    "is_perfect": true
  }
]`;
}

export async function generateFeedback(utterances: string[], lang: string = "ko"): Promise<GeminiFeedbackItem[]> {
  const formattedUtterances = utterances.map((u, i) => `${i + 1}. ${u}`).join("\n---\n");

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Please review these English utterances and provide one feedback per utterance:\n\n${formattedUtterances}` }],
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

export async function generateTranslation(sentence: string, lang: string = "ko"): Promise<string> {
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
        parts: [{ text: `Translate this English sentence to ${targetLang}. Respond with ONLY the translation, nothing else.\n\n"${sentence}"` }],
      },
    ],
    config: {
      temperature: 0.2,
    },
  });

  return response.text?.trim().replace(/^[""]|[""]$/g, "") || "";
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
