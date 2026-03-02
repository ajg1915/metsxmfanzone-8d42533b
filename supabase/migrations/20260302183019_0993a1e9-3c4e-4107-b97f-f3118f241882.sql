
-- Create mercari_listings table for manual product entries
CREATE TABLE public.mercari_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  mercari_url TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  condition TEXT DEFAULT 'Like New',
  is_sold BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mercari_listings ENABLE ROW LEVEL SECURITY;

-- Anyone can view published listings
CREATE POLICY "Anyone can view published mercari listings"
ON public.mercari_listings
FOR SELECT
USING (published = true);

-- Admins can manage all listings
CREATE POLICY "Admins can manage mercari listings"
ON public.mercari_listings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at trigger
CREATE TRIGGER update_mercari_listings_updated_at
BEFORE UPDATE ON public.mercari_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
