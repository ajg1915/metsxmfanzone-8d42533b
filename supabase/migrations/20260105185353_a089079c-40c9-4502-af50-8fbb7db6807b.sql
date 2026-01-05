-- Create table to store trusted admin devices
CREATE TABLE IF NOT EXISTS public.admin_trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, device_fingerprint)
);

-- Enable RLS
ALTER TABLE public.admin_trusted_devices ENABLE ROW LEVEL SECURITY;

-- Only admins can manage their own devices
CREATE POLICY "Admins can view own devices" ON public.admin_trusted_devices
FOR SELECT TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert own devices" ON public.admin_trusted_devices
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own devices" ON public.admin_trusted_devices
FOR UPDATE TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete own devices" ON public.admin_trusted_devices
FOR DELETE TO authenticated
USING (auth.uid() = user_id AND public.has_role(auth.uid(), 'admin'));

-- Create table to track admin login attempts (for rate limiting)
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fingerprint TEXT NOT NULL,
  ip_address TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Enable RLS but allow service role to manage
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;

-- No public access - only edge function with service role can access
CREATE POLICY "Service role only" ON public.admin_login_attempts
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Add index for performance
CREATE INDEX idx_admin_login_attempts_fingerprint ON public.admin_login_attempts(device_fingerprint, attempted_at);
CREATE INDEX idx_admin_login_attempts_ip ON public.admin_login_attempts(ip_address, attempted_at);