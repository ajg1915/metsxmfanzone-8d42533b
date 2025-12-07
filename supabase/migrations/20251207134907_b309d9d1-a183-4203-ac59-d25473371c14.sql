
-- Fix profiles table RLS policies to properly protect sensitive data
-- Drop existing policies and recreate as PERMISSIVE policies

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Recreate policies as PERMISSIVE (default) with proper security
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Fix newsletter_subscribers table RLS policies
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can insert subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.newsletter_subscribers;

-- Recreate as PERMISSIVE with admin-only access
CREATE POLICY "Admins can view all subscribers"
ON public.newsletter_subscribers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert subscribers"
ON public.newsletter_subscribers
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update subscribers"
ON public.newsletter_subscribers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete subscribers"
ON public.newsletter_subscribers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Allow anonymous newsletter signups (insert only, no read access)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon
WITH CHECK (true);
