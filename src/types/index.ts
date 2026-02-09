export interface Utterance {
  speaker: string;
  text: string;
}

export interface Feedback {
  id: string;
  session_id: string;
  created_at: string;
  original: string;
  paraphrase: string;
  explanation: string;
  is_perfect: boolean;
  saved?: boolean;
  translation?: string;
}

export interface Expression {
  id: string;
  session_id: string;
  created_at: string;
  keyword: string;
  meaning: string;
  example: string;
  highlight_word: string;
  saved: boolean;
}

export interface Session {
  id: string;
  created_at: string;
  transcript: string;
  audio_url: string | null;
  feedback_count: number;
  duration?: number;
  utterances?: Utterance[];
  my_speaker?: string;
  feedbacks?: Feedback[];
  title?: string | null;
  expressions?: Expression[];
  status?: string;
}

export interface GeminiFeedbackItem {
  original: string;
  paraphrase: string;
  explanation: string;
  is_perfect: boolean;
}

export interface GeminiExpressionItem {
  keyword: string;
  meaning: string;
  example: string;
  highlight_word: string;
}
