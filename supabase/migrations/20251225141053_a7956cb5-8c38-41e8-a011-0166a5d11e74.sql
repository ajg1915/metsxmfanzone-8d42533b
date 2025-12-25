-- Fix the view to not use SECURITY DEFINER - use regular view with RLS on base table
DROP VIEW IF EXISTS public.business_ads_public;

CREATE VIEW public.business_ads_public 
WITH (security_invoker = true) AS
SELECT 
    id,
    business_name,
    ad_title,
    ad_description,
    ad_image_url,
    website_url,
    status,
    published_at,
    created_at
FROM public.business_ads
WHERE status = 'approved';

-- Grant public read access to the view
GRANT SELECT ON public.business_ads_public TO anon, authenticated;