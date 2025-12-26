-- Create stream health reports table
CREATE TABLE public.stream_health_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT NOT NULL,
  user_agent TEXT,
  session_id TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stream alerts table for active viewer notifications
CREATE TABLE public.stream_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stream_health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_alerts ENABLE ROW LEVEL SECURITY;

-- Public can insert health reports (from viewers)
CREATE POLICY "Anyone can report stream issues"
ON public.stream_health_reports
FOR INSERT
WITH CHECK (true);

-- Admins can view all reports
CREATE POLICY "Admins can view health reports"
ON public.stream_health_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update reports
CREATE POLICY "Admins can update health reports"
ON public.stream_health_reports
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Public can view active alerts
CREATE POLICY "Public can view active alerts"
ON public.stream_alerts
FOR SELECT
USING (is_active = true);

-- Admins can manage alerts
CREATE POLICY "Admins can manage alerts"
ON public.stream_alerts
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create indexes for performance
CREATE INDEX idx_stream_health_reports_stream_id ON public.stream_health_reports(stream_id);
CREATE INDEX idx_stream_health_reports_created_at ON public.stream_health_reports(created_at DESC);
CREATE INDEX idx_stream_health_reports_resolved ON public.stream_health_reports(resolved);
CREATE INDEX idx_stream_alerts_stream_id ON public.stream_alerts(stream_id);
CREATE INDEX idx_stream_alerts_active ON public.stream_alerts(is_active);

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_health_reports;