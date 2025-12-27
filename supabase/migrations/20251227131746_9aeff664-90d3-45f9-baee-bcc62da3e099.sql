-- Drop existing insecure policies on webauthn_challenges
DROP POLICY IF EXISTS "Anyone can read challenges" ON public.webauthn_challenges;
DROP POLICY IF EXISTS "Anyone can insert challenges" ON public.webauthn_challenges;
DROP POLICY IF EXISTS "Anyone can delete challenges" ON public.webauthn_challenges;

-- Create more restrictive policies for webauthn_challenges

-- Policy: Authenticated users can read their own challenges, or recent challenges for unauthenticated login flow
CREATE POLICY "Users can read own or recent challenges"
ON public.webauthn_challenges
FOR SELECT
USING (
  user_id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR (user_id IS NULL AND created_at > (now() - interval '5 minutes'))
);

-- Policy: Allow challenge insertion (needed for both authenticated registration and unauthenticated login)
CREATE POLICY "Allow challenge creation"
ON public.webauthn_challenges
FOR INSERT
WITH CHECK (true);

-- Policy: Users can delete their own challenges, or system can delete expired ones
CREATE POLICY "Users can delete own challenges"
ON public.webauthn_challenges
FOR DELETE
USING (
  user_id = auth.uid() 
  OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR expires_at < now()
);