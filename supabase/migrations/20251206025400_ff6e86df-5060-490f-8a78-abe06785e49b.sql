-- Drop the current authenticated users policy on business_ads
DROP POLICY IF EXISTS "Authenticated users can view approved ads" ON public.business_ads;

-- Create a new policy that only allows users to see their own ads or admins to see all
-- Public viewing should use the business_ads_public view which excludes contact info
CREATE POLICY "Users can view their own ads or admins can view all" 
ON public.business_ads 
FOR SELECT 
USING (
  auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
);

-- Ensure profiles table has strict RLS - verify it's enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (extra security layer)
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.business_ads FORCE ROW LEVEL SECURITY;