-- Create SEO settings table
CREATE TABLE public.seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for SEO settings
CREATE POLICY "Anyone can view SEO settings"
  ON public.seo_settings
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert SEO settings"
  ON public.seo_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update SEO settings"
  ON public.seo_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete SEO settings"
  ON public.seo_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Insert default SEO settings for main pages
INSERT INTO public.seo_settings (page_path, page_name, title, description, keywords) VALUES
('/', 'Home', 'MetsXMFanZone - Your Ultimate Mets Fan Destination', 'Join the ultimate New York Mets fan community. Live streams, exclusive content, news, and more for true Mets fans.', 'Mets, New York Mets, baseball, MLB, fan community'),
('/live', 'Live Streams', 'Watch Mets Live Streams - Live Game Coverage & Analysis | MetsXMFanZone', 'Watch New York Mets live streams, pre-game shows, post-game analysis, and exclusive fan content. Stream live Mets games and coverage 24/7.', 'Mets live stream, watch Mets live, Mets game stream, live baseball'),
('/blog', 'Blog', 'Mets News, Analysis & Updates - MetsXMFanZone Blog', 'Latest New York Mets news, game analysis, player updates, and exclusive content. Stay informed with in-depth Mets coverage and commentary.', 'Mets news, Mets blog, Mets analysis, New York Mets updates'),
('/community', 'Community', 'Mets Fan Community - Connect with Fellow Mets Fans | MetsXMFanZone', 'Join the ultimate Mets fan community. Share your thoughts, connect with other fans, and discuss everything Mets baseball.', 'Mets community, Mets fans, baseball community'),
('/spring-training-2026', 'Spring Training 2026', 'Mets Spring Training 2026 - Port St. Lucie Schedule & Info | MetsXMFanZone', 'Complete 2026 New York Mets Spring Training schedule, game times, and location details. Get all the info for Mets training camp in Port St. Lucie, Florida.', 'Mets spring training 2026, Port St. Lucie, Clover Park');