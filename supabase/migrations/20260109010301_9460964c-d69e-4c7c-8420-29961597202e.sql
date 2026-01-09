
-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedbacks;
DROP POLICY IF EXISTS "Authenticated users can view feedbacks" ON public.feedbacks;
DROP POLICY IF EXISTS "Public Read Access" ON public.feedbacks;

-- Create policy to allow anyone to read feedbacks (for testimonials display)
CREATE POLICY "Anyone can view feedbacks" 
ON public.feedbacks 
FOR SELECT 
USING (true);
