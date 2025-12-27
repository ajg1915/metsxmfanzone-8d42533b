-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own business ads" ON public.business_ads;
DROP POLICY IF EXISTS "Users can create own business ads" ON public.business_ads;
DROP POLICY IF EXISTS "Users can update own business ads" ON public.business_ads;
DROP POLICY IF EXISTS "Users can delete own business ads" ON public.business_ads;

-- Recreate profiles policies - users can ONLY see their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Recreate business_ads policies - strict access controls
CREATE POLICY "Users can view own business ads" 
ON public.business_ads 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own business ads" 
ON public.business_ads 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own business ads" 
ON public.business_ads 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own business ads" 
ON public.business_ads 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));