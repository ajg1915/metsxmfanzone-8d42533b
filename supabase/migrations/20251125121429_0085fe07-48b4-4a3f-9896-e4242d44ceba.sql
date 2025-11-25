-- Create spring training games table for admin management
CREATE TABLE public.spring_training_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opponent TEXT NOT NULL,
  game_date DATE NOT NULL,
  preview_image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.spring_training_games ENABLE ROW LEVEL SECURITY;

-- Anyone can view published games
CREATE POLICY "Anyone can view published spring training games"
ON public.spring_training_games
FOR SELECT
USING (published = true);

-- Admins can manage all games
CREATE POLICY "Admins can insert spring training games"
ON public.spring_training_games
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update spring training games"
ON public.spring_training_games
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete spring training games"
ON public.spring_training_games
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  image_url TEXT,
  external_link TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
CREATE POLICY "Anyone can view published events"
ON public.events
FOR SELECT
USING (published = true);

-- Admins can manage all events
CREATE POLICY "Admins can insert events"
ON public.events
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update events"
ON public.events
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete events"
ON public.events
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all events"
ON public.events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));