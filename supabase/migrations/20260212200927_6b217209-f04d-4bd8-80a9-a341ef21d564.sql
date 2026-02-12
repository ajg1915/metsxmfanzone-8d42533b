
-- Add parlay-style stat prediction columns to daily_player_predictions
ALTER TABLE public.daily_player_predictions 
  ADD COLUMN IF NOT EXISTS is_pitcher boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS predicted_hr integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_walks integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_sb integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_strikeouts integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_hr_allowed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_walks_allowed integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confidence integer DEFAULT 50;
