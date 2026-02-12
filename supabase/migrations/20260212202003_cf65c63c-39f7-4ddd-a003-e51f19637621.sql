
-- Add new prediction stat columns for enhanced parlays
ALTER TABLE public.daily_player_predictions 
  ADD COLUMN IF NOT EXISTS predicted_rbis integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_runs integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_innings_pitched numeric(3,1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_saves integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS predicted_win_loss text DEFAULT null;
