
CREATE TABLE public.email_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  email_id TEXT,
  email_to TEXT,
  email_from TEXT,
  subject TEXT,
  event_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email events" ON public.email_events
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role insert" ON public.email_events
  FOR INSERT WITH CHECK (true);

CREATE INDEX idx_email_events_type ON public.email_events(event_type);
CREATE INDEX idx_email_events_created ON public.email_events(created_at DESC);
