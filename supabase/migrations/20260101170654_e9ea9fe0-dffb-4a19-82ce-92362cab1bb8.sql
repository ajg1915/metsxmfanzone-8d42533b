-- Fix 1: Ensure profiles table has strict RLS preventing enumeration
-- First, let's check and update policies to be more restrictive

-- Drop any overly permissive policies on profiles if they exist
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Public can view limited profile data" ON public.profiles;

-- Ensure only users can see their OWN profile data (strict policy)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Admins can view all profiles for management
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create a safe public_profiles view that only exposes non-PII data
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Fix 2: Ensure business_ads contact info is protected
-- The business_ads_public view already excludes contact_email and contact_phone
-- Let's verify the main table policies are tight

-- Ensure only owners and admins can see contact info on business_ads
-- The existing policies already restrict this, but let's make it explicit
DROP POLICY IF EXISTS "Public can view approved ads" ON public.business_ads;

-- Only allow viewing approved ads through the public view, not the main table
-- Users can still see their own ads with contact info