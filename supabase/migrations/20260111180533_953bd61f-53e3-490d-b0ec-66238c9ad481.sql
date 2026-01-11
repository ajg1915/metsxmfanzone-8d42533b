-- Create verification_meta_tags table for site verification tags
CREATE TABLE public.verification_meta_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  attribute_type VARCHAR(50) NOT NULL DEFAULT 'name',
  attribute_value VARCHAR(255) NOT NULL,
  content VARCHAR(500) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.verification_meta_tags ENABLE ROW LEVEL SECURITY;

-- Public read policy (meta tags need to be readable by the site)
CREATE POLICY "Public can read active verification tags"
ON public.verification_meta_tags
FOR SELECT
USING (is_active = true);

-- Admin can manage all verification tags
CREATE POLICY "Admins can manage verification tags"
ON public.verification_meta_tags
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_verification_meta_tags_updated_at
BEFORE UPDATE ON public.verification_meta_tags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert existing verification tags from index.html
INSERT INTO public.verification_meta_tags (name, attribute_type, attribute_value, content, description, is_active, display_order) VALUES
('Google Site Verification', 'name', 'google-site-verification', 'QwvX-HYTYuPTRADufkd-lj3v_rML6UhNe4vZEMnYdPA', 'Google Search Console verification', true, 1),
('Facebook Domain Verification', 'name', 'facebook-domain-verification', 'w5ciz1thomkdtq4z9qyt466zque1bc', 'Facebook Business verification', true, 2),
('Impact Site Verification', 'name', 'impact-site-verification', '3c3591e8-fc13-45a7-a624-aebf1411e46e', 'Impact affiliate network verification', true, 3);