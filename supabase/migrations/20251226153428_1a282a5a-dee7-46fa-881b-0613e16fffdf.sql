-- Create table to store user passkeys for WebAuthn/biometric authentication
CREATE TABLE public.user_passkeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_name TEXT,
  transports TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

-- Create index for faster lookups
CREATE INDEX idx_user_passkeys_user_id ON public.user_passkeys(user_id);
CREATE INDEX idx_user_passkeys_credential_id ON public.user_passkeys(credential_id);

-- Enable Row Level Security
ALTER TABLE public.user_passkeys ENABLE ROW LEVEL SECURITY;

-- Users can view their own passkeys
CREATE POLICY "Users can view own passkeys" 
  ON public.user_passkeys 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can insert their own passkeys
CREATE POLICY "Users can insert own passkeys" 
  ON public.user_passkeys 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own passkeys
CREATE POLICY "Users can delete own passkeys" 
  ON public.user_passkeys 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Users can update their own passkeys (for counter updates)
CREATE POLICY "Users can update own passkeys" 
  ON public.user_passkeys 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a table to store WebAuthn challenges temporarily
CREATE TABLE public.webauthn_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT,
  challenge TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('registration', 'authentication')),
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '5 minutes')
);

-- Create index for cleanup
CREATE INDEX idx_webauthn_challenges_expires_at ON public.webauthn_challenges(expires_at);

-- Enable RLS on challenges
ALTER TABLE public.webauthn_challenges ENABLE ROW LEVEL SECURITY;

-- Allow insert for challenges (service role will handle this)
CREATE POLICY "Anyone can insert challenges" 
  ON public.webauthn_challenges 
  FOR INSERT 
  WITH CHECK (true);

-- Allow select for challenges
CREATE POLICY "Anyone can read challenges" 
  ON public.webauthn_challenges 
  FOR SELECT 
  USING (true);

-- Allow delete for expired challenges cleanup
CREATE POLICY "Anyone can delete challenges" 
  ON public.webauthn_challenges 
  FOR DELETE 
  USING (true);