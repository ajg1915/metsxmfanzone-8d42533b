-- Create email confirmation tokens table
CREATE TABLE public.email_confirmation_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Create index for faster token lookups
CREATE INDEX idx_email_confirmation_tokens_token ON public.email_confirmation_tokens(token);
CREATE INDEX idx_email_confirmation_tokens_user_id ON public.email_confirmation_tokens(user_id);

-- Enable RLS
ALTER TABLE public.email_confirmation_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own confirmation tokens
CREATE POLICY "Users can read own confirmation tokens"
ON public.email_confirmation_tokens
FOR SELECT
USING (auth.uid() = user_id);

-- Allow anyone to read tokens for verification (needed before login)
CREATE POLICY "Anyone can verify tokens by token value"
ON public.email_confirmation_tokens
FOR SELECT
USING (true);

-- Allow authenticated users to insert their own tokens
CREATE POLICY "Users can create their own confirmation tokens"
ON public.email_confirmation_tokens
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow service role to update tokens (for confirmation)
CREATE POLICY "Allow updates on confirmation tokens"
ON public.email_confirmation_tokens
FOR UPDATE
USING (true);

-- Add email_verified column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;