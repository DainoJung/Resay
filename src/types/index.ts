export interface Feedback {
  id: string;
  session_id: string;
  created_at: string;
  original: string;
  paraphrase: string;
  explanation: string;
  category: "grammar" | "vocabulary" | "expression" | "pronunciation" | null;
}

export interface Session {
  id: string;
  created_at: string;
  transcript: string;
  audio_url: string | null;
  feedback_count: number;
  feedbacks?: Feedback[];
}

export interface GeminiFeedbackItem {
  original: string;
  paraphrase: string;
  explanation: string;
  category: "grammar" | "vocabulary" | "expression" | "pronunciation";
}
