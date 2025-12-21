-- Drop the security definer view - it's a security risk
DROP VIEW IF EXISTS public.user_subscription_status;

-- Instead, we'll ensure users must use the get_user_subscription_safe function
-- The RLS policy already restricts direct access appropriately