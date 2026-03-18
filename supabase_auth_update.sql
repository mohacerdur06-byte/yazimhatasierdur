-- Add `username` column to scores table to easily construct leaderboards without complex joins
ALTER TABLE public.scores ADD COLUMN IF NOT EXISTS username text;

-- Restrict inserting scores under another user_id unless it matches the authenticated user.
-- Enables guest anonymous logging while making authenticated scores secure.
DROP POLICY IF EXISTS "Allow public insert to scores" ON public.scores;
CREATE POLICY "Allow secure insert to scores" ON public.scores FOR INSERT 
WITH CHECK (
  user_id IS NULL OR auth.uid() = user_id
);
