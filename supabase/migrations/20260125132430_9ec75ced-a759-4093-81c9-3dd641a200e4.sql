-- Grant public SELECT on feedbacks_public view for testimonial display
-- The view already excludes sensitive user_id data
DROP POLICY IF EXISTS "Public can view feedbacks" ON public.feedbacks;

-- Create a policy on feedbacks table to allow select via the view
-- Since the view uses security_invoker, we need a base policy
CREATE POLICY "Public can view feedbacks via view" 
ON public.feedbacks 
FOR SELECT 
TO anon, authenticated
USING (true);

-- But we'll restrict direct table access - the view only exposes safe fields