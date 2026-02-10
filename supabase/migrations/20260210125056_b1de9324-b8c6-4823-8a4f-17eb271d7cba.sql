
-- Create game_alerts table for on-site alerts and push notifications
CREATE TABLE public.game_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  alert_type TEXT NOT NULL DEFAULT 'game_day' CHECK (alert_type IN ('game_day', 'score_update', 'breaking_news', 'live_stream', 'spring_training', 'general')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'urgent')),
  link_url TEXT DEFAULT '/',
  is_active BOOLEAN NOT NULL DEFAULT true,
  push_sent BOOLEAN NOT NULL DEFAULT false,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.game_alerts ENABLE ROW LEVEL SECURITY;

-- Public read for active alerts
CREATE POLICY "Anyone can view active alerts"
ON public.game_alerts FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Admin manage
CREATE POLICY "Authenticated users can manage alerts"
ON public.game_alerts FOR ALL
TO authenticated
USING (auth.uid() IS NOT NULL);

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.game_alerts;
