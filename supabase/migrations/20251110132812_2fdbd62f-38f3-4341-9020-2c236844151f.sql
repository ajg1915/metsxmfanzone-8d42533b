-- Create stories storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('stories', 'stories', true);

-- Create stories table
CREATE TABLE public.stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  thumbnail_url TEXT,
  duration INTEGER, -- Duration in seconds for videos
  display_order INTEGER DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view published stories"
  ON public.stories
  FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all stories"
  ON public.stories
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create stories"
  ON public.stories
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update stories"
  ON public.stories
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete stories"
  ON public.stories
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Storage policies for stories bucket
CREATE POLICY "Anyone can view published stories files"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'stories');

CREATE POLICY "Admins can upload stories files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'stories' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update stories files"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'stories' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete stories files"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'stories' AND has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_stories_updated_at
  BEFORE UPDATE ON public.stories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();