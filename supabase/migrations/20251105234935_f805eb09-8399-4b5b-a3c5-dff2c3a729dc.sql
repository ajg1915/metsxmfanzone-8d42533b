-- Create podcasts table
CREATE TABLE public.podcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration INTEGER,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- Policies for podcasts
CREATE POLICY "Anyone can view published podcasts"
  ON public.podcasts
  FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all podcasts"
  ON public.podcasts
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create podcasts"
  ON public.podcasts
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update podcasts"
  ON public.podcasts
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete podcasts"
  ON public.podcasts
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_podcasts_updated_at
  BEFORE UPDATE ON public.podcasts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create storage bucket for podcast audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('podcasts', 'podcasts', true);

-- Storage policies for podcasts bucket
CREATE POLICY "Podcast files are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'podcasts');

CREATE POLICY "Admins can upload podcast files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'podcasts' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update podcast files"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'podcasts' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete podcast files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'podcasts' AND has_role(auth.uid(), 'admin'::app_role));