-- 1. Create questions table
CREATE TABLE public.questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text text NOT NULL,
  option_a text NOT NULL,
  option_b text NOT NULL,
  correct_answer text NOT NULL CHECK (correct_answer IN ('A', 'B')),
  difficulty integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create settings table
CREATE TABLE public.settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  questions_per_game integer DEFAULT 20,
  points_per_question integer DEFAULT 1
);

-- 3. Create scores table
CREATE TABLE public.scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid, -- For authenticated users. Can reference auth.users(id) if Supabase Auth is strictly used
  score integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;

-- Set up RLS Policies

-- Anyone can read questions and settings
CREATE POLICY "Allow public read access to questions" ON public.questions FOR READ USING (true);
CREATE POLICY "Allow public read access to settings" ON public.settings FOR READ USING (true);

-- Allow anyone to insert and read scores (Useful if playable without logging in)
-- If you implement Supabase Auth later, you can restrict this to `auth.uid() = user_id`
CREATE POLICY "Allow public insert to scores" ON public.scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to scores" ON public.scores FOR READ USING (true);


-- Optional: Insert initial default settings
INSERT INTO public.settings (questions_per_game, points_per_question) VALUES (20, 1);

-- Optional: Insert some sample questions
INSERT INTO public.questions (question_text, option_a, option_b, correct_answer, difficulty) VALUES
('Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', 'Herkez', 'Herkes', 'B', 1),
('Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', 'Yalnız', 'Yanlız', 'A', 1),
('Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', 'Şöför', 'Şoför', 'B', 2),
('Aşağıdaki kelimelerden hangisi doğru yazılmıştır?', 'Sürpriz', 'Süpriz', 'A', 2);
