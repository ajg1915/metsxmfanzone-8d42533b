-- Create podcast_live_stream table for vdo.ninja integration
CREATE TABLE public.podcast_live_stream (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Podcast Live Show',
  description TEXT,
  vdo_ninja_url TEXT,
  is_live BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcast_live_stream ENABLE ROW LEVEL SECURITY;

-- Public can view when live
CREATE POLICY "Anyone can view live podcast streams"
ON public.podcast_live_stream
FOR SELECT
USING (is_live = true);

-- Only authenticated users can manage
CREATE POLICY "Authenticated users can manage podcast streams"
ON public.podcast_live_stream
FOR ALL
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_podcast_live_stream_updated_at
BEFORE UPDATE ON public.podcast_live_stream
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Insert default row
INSERT INTO public.podcast_live_stream (title, description, is_live)
VALUES ('Podcast Live Show', 'Live podcast streaming via VDO.Ninja', false);