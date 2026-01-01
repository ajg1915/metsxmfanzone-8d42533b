-- Create hero_slides table for managing hero carousel content
CREATE TABLE public.hero_slides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_for_members BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;

-- Public can read published slides
CREATE POLICY "Anyone can view published hero slides" 
ON public.hero_slides 
FOR SELECT 
USING (published = true);

-- Admins can manage all slides
CREATE POLICY "Admins can manage hero slides" 
ON public.hero_slides 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_hero_slides_updated_at
BEFORE UPDATE ON public.hero_slides
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default member slides
INSERT INTO public.hero_slides (title, description, display_order, is_for_members, published) VALUES
('Welcome Back, Fan!', 'Your home for live Mets coverage, exclusive content, and community discussions. Dive into today''s action!', 1, true, true),
('Live Now', 'Check out our live streams, game highlights, and real-time updates. Stay connected to every play!', 2, true, true),
('Explore Your Benefits', 'Enjoy your member-exclusive podcasts, behind-the-scenes content, and premium features', 3, true, true);