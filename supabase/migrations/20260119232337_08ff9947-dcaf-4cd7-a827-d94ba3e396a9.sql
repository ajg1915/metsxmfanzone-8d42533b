-- Fix overly permissive RLS policies

-- 1. admin_login_attempts: These should only be accessible via service role (edge functions)
-- Drop the permissive policies and create restrictive ones that deny client access
DROP POLICY IF EXISTS "Service role only delete" ON public.admin_login_attempts;
DROP POLICY IF EXISTS "Service role only insert" ON public.admin_login_attempts;
DROP POLICY IF EXISTS "Service role only update" ON public.admin_login_attempts;
DROP POLICY IF EXISTS "Service role only select" ON public.admin_login_attempts;

-- Create policies that explicitly deny all client access (service role bypasses RLS anyway)
CREATE POLICY "Deny all client delete"
ON public.admin_login_attempts
FOR DELETE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny all client insert"
ON public.admin_login_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

CREATE POLICY "Deny all client update"
ON public.admin_login_attempts
FOR UPDATE
TO anon, authenticated
USING (false);

CREATE POLICY "Deny all client select"
ON public.admin_login_attempts
FOR SELECT
TO anon, authenticated
USING (false);

-- 2. email_confirmation_tokens: Fix the service role update policy
DROP POLICY IF EXISTS "Service role can update tokens" ON public.email_confirmation_tokens;

-- Service role bypasses RLS, so we don't need a policy for it
-- The existing "Users can update own tokens" policy is sufficient for authenticated users

-- 3. poll_votes: Fix the open INSERT policy
DROP POLICY IF EXISTS "Anyone can vote" ON public.poll_votes;

-- Create a more restrictive voting policy
-- Allow authenticated users to vote (linked to their user_id)
-- Allow anonymous voting with session_id tracking to prevent duplicate votes
CREATE POLICY "Authenticated users can vote"
ON public.poll_votes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anonymous users can vote with session"
ON public.poll_votes
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);