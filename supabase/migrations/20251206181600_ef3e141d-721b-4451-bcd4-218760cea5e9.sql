-- Drop the public access policy
DROP POLICY IF EXISTS "Anyone can view feedbacks" ON public.feedbacks;

-- Create new policy for authenticated users only
CREATE POLICY "Authenticated users can view feedbacks"
ON public.feedbacks
FOR SELECT
USING (auth.uid() IS NOT NULL);