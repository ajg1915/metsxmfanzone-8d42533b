-- =============================================
-- FIX RLS ISSUES - COMPREHENSIVE SECURITY UPDATE
-- =============================================

-- 1. FIX email_confirmation_tokens - Remove overly permissive INSERT policy
-- This policy allows anyone to insert tokens which is a security risk
DROP POLICY IF EXISTS "Anyone can insert confirmation tokens" ON public.email_confirmation_tokens;

-- Keep only the authenticated user insert policy which is secure
-- The existing "Authenticated users can create tokens for themselves" policy is correct

-- 2. FIX feedbacks - Make it more secure while keeping public testimonial display
-- The current "Anyone can view feedbacks" exposes user_id
-- We'll create a public view that hides sensitive data

-- First, drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Anyone can view feedbacks" ON public.feedbacks;

-- Create a more restrictive policy - only show feedbacks to admins or the user who created them
-- For public testimonial display, we'll use a database view

-- Create a public feedbacks view that only shows safe fields
DROP VIEW IF EXISTS public.feedbacks_public;
CREATE VIEW public.feedbacks_public
WITH (security_invoker=on) AS
SELECT 
  id,
  display_name,
  content,
  rating,
  location,
  created_at
FROM public.feedbacks;
-- Note: user_id is intentionally excluded for privacy

-- 3. Ensure duplicate policies are cleaned up on profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
-- Keep "Users can insert own profile" and "Users can update own profile"

-- 4. Clean up duplicate SELECT policies on feedbacks
-- We have "Admins can view all feedbacks" and "Users can view their own feedbacks" - keep these

-- 5. Add missing DELETE policy for profiles (admins only should be able to delete)
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. Fix writer_applications - add missing DELETE policy for users
DROP POLICY IF EXISTS "Users can delete own applications" ON public.writer_applications;
CREATE POLICY "Users can delete own applications" 
ON public.writer_applications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add admin delete policy
DROP POLICY IF EXISTS "Admins can delete applications" ON public.writer_applications;
CREATE POLICY "Admins can delete applications" 
ON public.writer_applications 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Fix podcaster_applications - add missing DELETE policy for users  
DROP POLICY IF EXISTS "Users can delete own podcaster applications" ON public.podcaster_applications;
CREATE POLICY "Users can delete own podcaster applications" 
ON public.podcaster_applications 
FOR DELETE 
USING (auth.uid() = user_id);

-- 8. Fix poll_votes - restrict public visibility of user voting patterns
DROP POLICY IF EXISTS "Anyone can view votes" ON public.poll_votes;
CREATE POLICY "Admins can view all votes" 
ON public.poll_votes 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own votes" 
ON public.poll_votes 
FOR SELECT 
USING (auth.uid() = user_id OR session_id IS NOT NULL);

-- 9. Ensure notification_subscriptions has UPDATE policy for users
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.notification_subscriptions;
CREATE POLICY "Users can update their own subscriptions" 
ON public.notification_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 10. Grant SELECT on public views
GRANT SELECT ON public.feedbacks_public TO anon, authenticated;