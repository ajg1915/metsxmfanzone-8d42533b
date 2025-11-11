-- Create business_ads table for businesses to submit advertisements
CREATE TABLE public.business_ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  ad_title TEXT NOT NULL,
  ad_description TEXT NOT NULL,
  ad_image_url TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  website_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.business_ads ENABLE ROW LEVEL SECURITY;

-- Users can view their own ads
CREATE POLICY "Users can view their own ads"
ON public.business_ads
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own ads
CREATE POLICY "Users can insert their own ads"
ON public.business_ads
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending ads
CREATE POLICY "Users can update their own pending ads"
ON public.business_ads
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all ads
CREATE POLICY "Admins can view all ads"
ON public.business_ads
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Admins can update any ad
CREATE POLICY "Admins can update any ad"
ON public.business_ads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Admins can delete any ad
CREATE POLICY "Admins can delete any ad"
ON public.business_ads
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Anyone can view approved ads
CREATE POLICY "Anyone can view approved ads"
ON public.business_ads
FOR SELECT
USING (status = 'approved');

-- Add trigger for updated_at
CREATE TRIGGER update_business_ads_updated_at
BEFORE UPDATE ON public.business_ads
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();