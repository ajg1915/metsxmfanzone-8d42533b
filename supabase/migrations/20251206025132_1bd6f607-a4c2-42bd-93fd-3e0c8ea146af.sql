-- Drop the public policy that exposes contact info
DROP POLICY IF EXISTS "Anyone can view approved ads" ON public.business_ads;

-- Create a new policy that only shows approved ads to authenticated users (who can see contact info)
CREATE POLICY "Authenticated users can view approved ads" 
ON public.business_ads 
FOR SELECT 
USING (
  (status = 'approved' AND auth.uid() IS NOT NULL)
);

-- Create a view for public (unauthenticated) access that masks contact info
CREATE OR REPLACE VIEW public.business_ads_public AS
SELECT 
  id,
  business_name,
  ad_title,
  ad_description,
  ad_image_url,
  website_url,
  published_at,
  status,
  created_at
FROM public.business_ads
WHERE status = 'approved';