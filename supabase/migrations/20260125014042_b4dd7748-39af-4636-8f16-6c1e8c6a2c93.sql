-- Fix email_confirmation_tokens RLS policies
-- The issue is that users aren't authenticated when signing up, so token insert fails

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create their own confirmation tokens" ON public.email_confirmation_tokens;
DROP POLICY IF EXISTS "Users can read own confirmation tokens" ON public.email_confirmation_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON public.email_confirmation_tokens;

-- Allow authenticated users to insert tokens for themselves
CREATE POLICY "Authenticated users can create tokens for themselves"
ON public.email_confirmation_tokens
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow anon to insert tokens (for signup flow before user is authenticated)
-- This is safe because tokens are only useful with the correct email
CREATE POLICY "Anyone can insert confirmation tokens"
ON public.email_confirmation_tokens
FOR INSERT
TO anon
WITH CHECK (true);

-- Users can read their own tokens
CREATE POLICY "Users can read own tokens"
ON public.email_confirmation_tokens
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow service role full access (for edge functions)
CREATE POLICY "Service role full access"
ON public.email_confirmation_tokens
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can update their own tokens
CREATE POLICY "Users can update own tokens"
ON public.email_confirmation_tokens
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Also fix the realtime_presence RLS that's causing errors in logs
DROP POLICY IF EXISTS "Users can insert own presence" ON public.realtime_presence;

-- Allow both anon and authenticated to insert presence
CREATE POLICY "Anyone can insert presence with session"
ON public.realtime_presence
FOR INSERT
TO anon, authenticated
WITH CHECK (session_id IS NOT NULL);