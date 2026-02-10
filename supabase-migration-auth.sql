-- ============================================================
-- Resay Auth Migration
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  native_language TEXT NOT NULL DEFAULT 'ko',
  learning_language TEXT NOT NULL DEFAULT 'en',
  display_name TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  tts_voice TEXT NOT NULL DEFAULT 'Puck',
  tts_style TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Add user_id to sessions
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);

-- 3. Add user_id to feedbacks
ALTER TABLE public.feedbacks
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_id ON public.feedbacks(user_id);

-- 4. Add user_id to expressions
ALTER TABLE public.expressions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_expressions_user_id ON public.expressions(user_id);

-- 5. Drop old public RLS policies (adjust names to match your existing policies)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('sessions', 'feedbacks', 'expressions')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- 6. Create user-based RLS policies for sessions
CREATE POLICY "Users can read own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass for API routes
CREATE POLICY "Service role full access sessions"
  ON public.sessions FOR ALL
  USING (auth.role() = 'service_role');

-- 7. Create user-based RLS policies for feedbacks
CREATE POLICY "Users can read own feedbacks"
  ON public.feedbacks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedbacks"
  ON public.feedbacks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own feedbacks"
  ON public.feedbacks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access feedbacks"
  ON public.feedbacks FOR ALL
  USING (auth.role() = 'service_role');

-- 8. Create user-based RLS policies for expressions
CREATE POLICY "Users can read own expressions"
  ON public.expressions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expressions"
  ON public.expressions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expressions"
  ON public.expressions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access expressions"
  ON public.expressions FOR ALL
  USING (auth.role() = 'service_role');

-- 9. Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
