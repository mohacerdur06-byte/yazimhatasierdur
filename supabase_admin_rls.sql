-- Update the questions and settings Row Level Security (RLS) policies 
-- to allow the admin panel to insert, update, and delete rows without needing an authenticated user token.

-- WARNING: This allows anyone who reaches the Supabase API to alter the database.
-- Since this is a simple local app utilizing an application-level password constraint, it works. 
-- In a real-world production app, you should use Supabase Auth to enforce auth.uid() checks.

CREATE POLICY "Allow public insert to questions" ON public.questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to questions" ON public.questions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete to questions" ON public.questions FOR DELETE USING (true);

CREATE POLICY "Allow public update to settings" ON public.settings FOR UPDATE USING (true);
