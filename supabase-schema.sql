-- Resay Database Schema
-- Run this in Supabase SQL Editor

-- 녹음 세션
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  transcript TEXT NOT NULL,
  audio_url TEXT,
  feedback_count INTEGER DEFAULT 0
);

-- 피드백 항목
CREATE TABLE feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  original TEXT NOT NULL,
  paraphrase TEXT NOT NULL,
  explanation TEXT NOT NULL,
  category TEXT  -- grammar, vocabulary, expression, pronunciation
);

-- RLS: 공개 읽기, 쓰기는 service role만
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON sessions FOR SELECT USING (true);
CREATE POLICY "Public read" ON feedbacks FOR SELECT USING (true);
