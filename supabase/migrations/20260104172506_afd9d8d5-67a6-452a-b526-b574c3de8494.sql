-- Create site_settings table for storing website configuration
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL DEFAULT '{}',
  setting_type TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can read settings (needed for frontend to check maintenance mode, etc.)
CREATE POLICY "Anyone can view site settings" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Policy: Only admins can modify settings
CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
('site_branding', '{"site_name": "MetsXM Fan Zone", "tagline": "Your Ultimate Mets Fan Community", "contact_email": "", "contact_phone": "", "facebook_url": "", "twitter_url": "", "instagram_url": "", "youtube_url": ""}', 'branding'),
('feature_toggles', '{"newsletter_enabled": true, "live_streams_enabled": true, "community_enabled": true, "podcast_enabled": true, "blog_enabled": true, "stories_enabled": true, "merch_enabled": true}', 'features'),
('maintenance_mode', '{"enabled": false, "message": "We are currently performing scheduled maintenance. Please check back soon!"}', 'maintenance');