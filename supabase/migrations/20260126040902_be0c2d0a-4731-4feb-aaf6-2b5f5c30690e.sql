-- =============================================
-- FIX 1: Consolidate profiles table SELECT policies
-- =============================================

-- Drop duplicate/redundant SELECT policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Create single consolidated policy for user profile access
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- =============================================
-- FIX 2: Consolidate business_ads table policies
-- =============================================

-- Drop all duplicate/overlapping SELECT policies
DROP POLICY IF EXISTS "Users can view own business ads" ON public.business_ads;
DROP POLICY IF EXISTS "Users can view their own ads" ON public.business_ads;
DROP POLICY IF EXISTS "Users can view their own ads or admins can view all" ON public.business_ads;

-- Create single consolidated SELECT policy
CREATE POLICY "Users can view own ads"
ON public.business_ads
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Drop duplicate INSERT policies  
DROP POLICY IF EXISTS "Users can create own business ads" ON public.business_ads;
DROP POLICY IF EXISTS "Users can insert their own ads" ON public.business_ads;

-- Create single INSERT policy
CREATE POLICY "Users can create own ads"
ON public.business_ads
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Drop duplicate/overlapping UPDATE policies
DROP POLICY IF EXISTS "Users can update own business ads" ON public.business_ads;
DROP POLICY IF EXISTS "Users can update their own pending ads" ON public.business_ads;

-- Create single UPDATE policy (users can only update their own ads)
CREATE POLICY "Users can update own ads"
ON public.business_ads
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Drop duplicate DELETE policy (keep admin one separate)
DROP POLICY IF EXISTS "Users can delete own business ads" ON public.business_ads;

-- Create single DELETE policy for users
CREATE POLICY "Users can delete own ads"
ON public.business_ads
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);