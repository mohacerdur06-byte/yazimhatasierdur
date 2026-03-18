-- Lightweight Gamification Schema
CREATE TABLE public.user_profiles (
  user_id uuid PRIMARY KEY,
  username text,
  xp integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  last_played_at date,
  achievements text[] DEFAULT '{}'::text[]
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read so we can utilize it for leaderboards later if requested
CREATE POLICY "Public read user profiles" ON public.user_profiles FOR READ USING (true);

-- Allow users to update and insert their own profile
CREATE POLICY "User update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "User insert own profile" ON public.user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
