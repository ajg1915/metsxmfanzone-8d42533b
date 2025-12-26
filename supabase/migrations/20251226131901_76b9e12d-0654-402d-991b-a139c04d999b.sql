-- Drop the overly permissive SELECT policy that allows anyone to read all tokens
DROP POLICY IF EXISTS "Anyone can verify tokens by token value" ON public.email_confirmation_tokens;

-- The existing "Users can read own confirmation tokens" policy remains which properly restricts access
-- The edge function verify-email-confirmation uses service role key and bypasses RLS for verification