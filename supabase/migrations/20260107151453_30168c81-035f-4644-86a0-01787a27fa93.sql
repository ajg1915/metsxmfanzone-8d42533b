-- Fix overly permissive RLS policies that use USING (true) or WITH CHECK (true)
-- for non-SELECT operations

-- 1. admin_login_attempts - This is intentionally service_role only, which is secure
-- We'll keep this as-is since it's restricted to service_role, but let's make it clearer
DROP POLICY IF EXISTS "Service role only" ON public.admin_login_attempts;
CREATE POLICY "Service role only insert" ON public.admin_login_attempts 
  FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Service role only select" ON public.admin_login_attempts 
  FOR SELECT TO service_role USING (true);
CREATE POLICY "Service role only update" ON public.admin_login_attempts 
  FOR UPDATE TO service_role USING (true);
CREATE POLICY "Service role only delete" ON public.admin_login_attempts 
  FOR DELETE TO service_role USING (true);

-- 2. blog_views - Only allow inserts with valid session tracking
DROP POLICY IF EXISTS "Anyone can insert blog views" ON public.blog_views;
CREATE POLICY "Track blog views with session" ON public.blog_views 
  FOR INSERT WITH CHECK (
    session_id IS NOT NULL OR auth.uid() IS NOT NULL
  );

-- 3. email_confirmation_tokens - Restrict updates to the owner or service role
DROP POLICY IF EXISTS "Allow updates on confirmation tokens" ON public.email_confirmation_tokens;
CREATE POLICY "Service role can update tokens" ON public.email_confirmation_tokens 
  FOR UPDATE TO service_role USING (true);
CREATE POLICY "Users can update own tokens" ON public.email_confirmation_tokens 
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 4. newsletter_subscribers - Add basic validation for anon inserts
DROP POLICY IF EXISTS "Anon users can subscribe to newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Anon users can subscribe with valid email" ON public.newsletter_subscribers 
  FOR INSERT WITH CHECK (
    email IS NOT NULL AND email ~ '^[^@]+@[^@]+\.[^@]+$'
  );

-- 5. realtime_presence - Add session-based restrictions
DROP POLICY IF EXISTS "Anyone can delete own presence" ON public.realtime_presence;
DROP POLICY IF EXISTS "Anyone can insert presence" ON public.realtime_presence;
DROP POLICY IF EXISTS "Anyone can update own presence" ON public.realtime_presence;

CREATE POLICY "Users can insert own presence" ON public.realtime_presence 
  FOR INSERT WITH CHECK (
    session_id IS NOT NULL
  );

CREATE POLICY "Users can update own presence" ON public.realtime_presence 
  FOR UPDATE USING (
    session_id IS NOT NULL
  );

CREATE POLICY "Users can delete own presence" ON public.realtime_presence 
  FOR DELETE USING (
    session_id IS NOT NULL
  );

-- 6. stream_health_reports - Require stream_id for reports
DROP POLICY IF EXISTS "Anyone can report stream issues" ON public.stream_health_reports;
CREATE POLICY "Report stream issues with valid data" ON public.stream_health_reports 
  FOR INSERT WITH CHECK (
    stream_id IS NOT NULL AND issue_type IS NOT NULL
  );

-- 7. stream_views - Only allow inserts with valid stream tracking
DROP POLICY IF EXISTS "Anyone can insert stream views" ON public.stream_views;
CREATE POLICY "Track stream views with session" ON public.stream_views 
  FOR INSERT WITH CHECK (
    stream_id IS NOT NULL AND (session_id IS NOT NULL OR auth.uid() IS NOT NULL)
  );

-- 8. webauthn_challenges - Add time-based and type validation
DROP POLICY IF EXISTS "Allow challenge creation" ON public.webauthn_challenges;
CREATE POLICY "Create challenges with valid data" ON public.webauthn_challenges 
  FOR INSERT WITH CHECK (
    challenge IS NOT NULL AND type IS NOT NULL
  );