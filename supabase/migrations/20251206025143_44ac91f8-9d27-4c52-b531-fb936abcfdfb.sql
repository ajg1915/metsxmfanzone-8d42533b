-- Drop the view with security definer issue
DROP VIEW IF EXISTS public.business_ads_public;

-- Recreate the view with SECURITY INVOKER (default, but explicit is better)
CREATE VIEW public.business_ads_public 
WITH (security_invoker = true)
AS
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

-- Grant read access on the view to anon and authenticated roles
GRANT SELECT ON public.business_ads_public TO anon, authenticated;