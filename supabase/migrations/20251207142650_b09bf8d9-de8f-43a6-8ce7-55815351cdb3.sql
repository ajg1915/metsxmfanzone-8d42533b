-- Fix podcast_live_stream security: Only admins can manage, only subscribers can view

-- Drop the dangerous overly permissive policy
DROP POLICY IF EXISTS "Authenticated users can manage podcast streams" ON public.podcast_live_stream;
DROP POLICY IF EXISTS "Anyone can view live podcast streams" ON public.podcast_live_stream;

-- Create a security definer function to check if user has an active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.subscriptions
    WHERE user_id = _user_id
      AND status = 'active'
      AND plan_type IN ('premium', 'annual')
      AND (end_date IS NULL OR end_date > now())
  )
$$;

-- Admins can fully manage podcast streams
CREATE POLICY "Admins can manage podcast streams" 
ON public.podcast_live_stream 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only subscribers with active premium/annual plans can view live streams
CREATE POLICY "Subscribers can view live podcast streams" 
ON public.podcast_live_stream 
FOR SELECT 
TO authenticated
USING (is_live = true AND has_active_subscription(auth.uid()));

-- Admins can always view all podcast streams (including non-live)
CREATE POLICY "Admins can view all podcast streams" 
ON public.podcast_live_stream 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));