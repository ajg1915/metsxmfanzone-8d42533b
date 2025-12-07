-- Fix profiles table: Ensure only authenticated users can access their own data and admins can view all
-- Drop existing SELECT policies and recreate as PERMISSIVE with proper restrictions
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new PERMISSIVE policies (default behavior grants access only if policy conditions are met)
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix newsletter_subscribers table: Restrict SELECT to admins only
-- Currently there's no protection for anonymous users reading subscriber data
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.newsletter_subscribers;

-- Create policy that only allows admins to view subscribers
CREATE POLICY "Only admins can view subscribers" 
ON public.newsletter_subscribers 
FOR SELECT 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add explicit denial for anonymous users trying to read profiles (defense in depth)
-- RLS is already enabled, but we ensure the TO clause restricts to authenticated only