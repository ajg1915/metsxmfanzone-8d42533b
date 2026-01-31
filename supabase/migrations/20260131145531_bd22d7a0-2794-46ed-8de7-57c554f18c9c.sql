-- Create podcast_shows table for managed show schedule
CREATE TABLE public.podcast_shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  show_date TIMESTAMP WITH TIME ZONE NOT NULL,
  show_type TEXT NOT NULL DEFAULT 'regular', -- regular, pregame, weekend
  thumbnail_gradient TEXT, -- CSS gradient for thumbnail background
  thumbnail_colors JSONB DEFAULT '[]'::jsonb, -- Array of colors used
  is_featured BOOLEAN DEFAULT false,
  is_live BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcast_shows ENABLE ROW LEVEL SECURITY;

-- Admins can manage all shows
CREATE POLICY "Admins can manage podcast shows"
ON public.podcast_shows
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view published shows
CREATE POLICY "Anyone can view published podcast shows"
ON public.podcast_shows
FOR SELECT
USING (published = true);

-- Create trigger for updated_at
CREATE TRIGGER update_podcast_shows_updated_at
BEFORE UPDATE ON public.podcast_shows
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();