
-- Create table for daily player predictions
CREATE TABLE public.daily_player_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  player_id INTEGER,
  player_image_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('hot', 'cold')),
  description TEXT NOT NULL,
  prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_player_predictions ENABLE ROW LEVEL SECURITY;

-- Public read access for everyone
CREATE POLICY "Public Read Access" ON public.daily_player_predictions 
FOR SELECT USING (true);

-- Authenticated users can manage (for admin/system updates)
CREATE POLICY "Authenticated Manage" ON public.daily_player_predictions 
FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

-- Create index for date lookups
CREATE INDEX idx_daily_player_predictions_date ON public.daily_player_predictions(prediction_date);

-- Create trigger for updated_at
CREATE TRIGGER update_daily_player_predictions_updated_at
BEFORE UPDATE ON public.daily_player_predictions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
