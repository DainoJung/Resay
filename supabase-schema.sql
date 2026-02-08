-- Resay Database Schema
-- Run this in Supabase SQL Editor

-- 녹음 세션
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  transcript TEXT NOT NULL,
  audio_url TEXT,
  feedback_count INTEGER DEFAULT 0,
  utterances TEXT,     -- JSON string of speaker-labeled utterances
  my_speaker TEXT      -- which speaker is "me"
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

-- 세션 타이틀 (AI 생성)
-- ALTER TABLE sessions ADD COLUMN title TEXT;

-- 원어민 표현
CREATE TABLE expressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  keyword TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT NOT NULL,
  highlight_word TEXT NOT NULL,
  saved BOOLEAN DEFAULT false
);
ALTER TABLE expressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON expressions FOR SELECT USING (true);

-- 피드백 저장 기능
-- ALTER TABLE feedbacks ADD COLUMN saved BOOLEAN DEFAULT false;

-- 기존 테이블에 새 컬럼 추가 (이미 테이블이 있는 경우)
-- ALTER TABLE sessions ADD COLUMN utterances TEXT;
-- ALTER TABLE sessions ADD COLUMN my_speaker TEXT;
