-- Create admin verification codes table with hashed PINs
CREATE TABLE public.admin_verification_codes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE,
    code_hash text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_verification_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can manage their own verification code
CREATE POLICY "Admins can view their own code" 
ON public.admin_verification_codes 
FOR SELECT 
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert their own code" 
ON public.admin_verification_codes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update their own code" 
ON public.admin_verification_codes 
FOR UPDATE 
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete their own code" 
ON public.admin_verification_codes 
FOR DELETE 
USING (auth.uid() = user_id AND has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_admin_verification_codes_updated_at
BEFORE UPDATE ON public.admin_verification_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update business_ads_public view to remove sensitive contact info
DROP VIEW IF EXISTS public.business_ads_public;

CREATE VIEW public.business_ads_public AS
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

-- Note: contact_email and contact_phone are intentionally excluded for security