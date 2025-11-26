-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create lineup_cards table
CREATE TABLE public.lineup_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  game_date TIMESTAMP WITH TIME ZONE NOT NULL,
  game_time TEXT NOT NULL,
  opponent TEXT NOT NULL,
  location TEXT,
  lineup_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  starting_pitcher JSONB,
  notes TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lineup_cards ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view published lineup cards"
ON public.lineup_cards
FOR SELECT
USING (published = true);

CREATE POLICY "Admins can view all lineup cards"
ON public.lineup_cards
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create lineup cards"
ON public.lineup_cards
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lineup cards"
ON public.lineup_cards
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lineup cards"
ON public.lineup_cards
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_lineup_cards_updated_at
BEFORE UPDATE ON public.lineup_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();