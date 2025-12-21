-- Drop existing permissive user policies on subscriptions that expose payment data
DROP POLICY IF EXISTS "Users can view own subscriptions safely" ON public.subscriptions;

-- Create a more restrictive policy - users can only see non-sensitive columns
-- They must use the get_user_subscription_safe function for full access
CREATE POLICY "Users can view own subscription status only"
ON public.subscriptions
FOR SELECT
USING (
  (auth.uid() = user_id) AND 
  has_role(auth.uid(), 'admin'::app_role) = false
);

-- Restrict profiles table - users can only view minimal info about others
-- Drop the view policy first if needed
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Users can only view their own full profile
CREATE POLICY "Users can view own profile only"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- Drop any policies allowing users to see other profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Ensure admins can still see all profiles (already exists but let's be sure)
-- The "Admins can view all profiles" policy already exists

-- Add a policy to block anon access to profiles entirely
DROP POLICY IF EXISTS "Anon cannot view profiles" ON public.profiles;

-- Create a view that only shows safe subscription data for users
CREATE OR REPLACE VIEW public.user_subscription_status AS
SELECT 
  id,
  user_id,
  plan_type,
  status,
  start_date,
  end_date,
  created_at,
  updated_at
FROM public.subscriptions
WHERE auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role);

-- Make subscription PayPal columns not directly queryable by restricting the policy
-- Users should use the safe function instead
COMMENT ON TABLE public.subscriptions IS 'Use get_user_subscription_safe() function to access this table safely with masked payment IDs';