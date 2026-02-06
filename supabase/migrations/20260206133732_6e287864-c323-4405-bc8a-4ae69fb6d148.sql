-- Add MLB API fields to spring_training_games for automated updates
ALTER TABLE public.spring_training_games 
ADD COLUMN IF NOT EXISTS mlb_game_pk integer UNIQUE,
ADD COLUMN IF NOT EXISTS game_time text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS home_team text,
ADD COLUMN IF NOT EXISTS away_team text,
ADD COLUMN IF NOT EXISTS is_home_game boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS game_status text DEFAULT 'scheduled',
ADD COLUMN IF NOT EXISTS is_auto_generated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_synced_at timestamptz;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_spring_training_mlb_game_pk ON public.spring_training_games(mlb_game_pk);
CREATE INDEX IF NOT EXISTS idx_spring_training_game_date ON public.spring_training_games(game_date);