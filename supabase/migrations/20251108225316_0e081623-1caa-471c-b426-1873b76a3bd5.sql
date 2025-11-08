-- Create mets_news_tracker table
CREATE TABLE public.mets_news_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('signing', 'rumor')),
  title TEXT NOT NULL,
  player TEXT NOT NULL,
  details TEXT NOT NULL,
  time_ago TEXT NOT NULL DEFAULT '1 hour ago',
  image_url TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mets_news_tracker ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can view all news tracker items"
  ON public.mets_news_tracker
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published news tracker items"
  ON public.mets_news_tracker
  FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can create news tracker items"
  ON public.mets_news_tracker
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update news tracker items"
  ON public.mets_news_tracker
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete news tracker items"
  ON public.mets_news_tracker
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_mets_news_tracker_updated_at
  BEFORE UPDATE ON public.mets_news_tracker
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();