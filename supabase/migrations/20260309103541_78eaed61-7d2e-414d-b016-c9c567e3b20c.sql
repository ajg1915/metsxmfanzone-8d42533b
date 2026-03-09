ALTER TABLE public.game_alerts ADD COLUMN IF NOT EXISTS alert_sound text DEFAULT 'default';
ALTER TABLE public.game_alerts ENABLE ROW LEVEL SECURITY;