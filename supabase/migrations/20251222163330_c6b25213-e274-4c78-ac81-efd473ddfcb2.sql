-- Drop table if partially created
DROP TABLE IF EXISTS public.background_settings;

-- Create background_settings table for managing auth/welcome screen backgrounds
CREATE TABLE public.background_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type TEXT NOT NULL CHECK (page_type IN ('auth', 'welcome')),
  background_type TEXT NOT NULL CHECK (background_type IN ('color', 'gradient', 'image')),
  background_value TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.background_settings ENABLE ROW LEVEL SECURITY;

-- Public read policy (anyone can see backgrounds)
CREATE POLICY "Anyone can view background settings"
ON public.background_settings
FOR SELECT
USING (true);

-- Admin-only write policies using correct function signature (user_id first, then role)
CREATE POLICY "Admins can insert background settings"
ON public.background_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update background settings"
ON public.background_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete background settings"
ON public.background_settings
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_background_settings_updated_at
BEFORE UPDATE ON public.background_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default backgrounds
INSERT INTO public.background_settings (page_type, background_type, background_value, is_active, name) VALUES
('auth', 'gradient', 'linear-gradient(135deg, #002D72 0%, #001a42 50%, #0a0a0a 100%)', true, 'Mets Blue Gradient'),
('auth', 'color', '#002D72', false, 'Mets Blue Solid'),
('auth', 'gradient', 'linear-gradient(180deg, #FF5910 0%, #002D72 100%)', false, 'Orange to Blue');