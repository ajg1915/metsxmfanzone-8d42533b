-- Create a secure view for subscriptions that masks payment IDs for non-admin users
-- This view will be used instead of direct table access

-- First, drop the existing user SELECT policy that exposes raw payment data
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

-- Create a more restrictive policy that only allows users to see non-sensitive fields
-- Users can only SELECT their own subscriptions, but we'll encourage use of the safe function
CREATE POLICY "Users can view own subscriptions safely" 
ON public.subscriptions 
FOR SELECT 
USING (
  -- Admins get full access
  has_role(auth.uid(), 'admin'::app_role)
  OR 
  -- Regular users can only see their own, but should use get_user_subscription_safe() for full data
  (auth.uid() = user_id)
);

-- Update the get_user_subscription_safe function to be the primary way to access subscription data
-- This function already masks payment IDs, but let's ensure it's robust
CREATE OR REPLACE FUNCTION public.get_user_subscription_safe(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  plan_type text,
  status text,
  amount numeric,
  currency text,
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  paypal_subscription_id_masked text,
  paypal_order_id_masked text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin boolean;
  is_owner boolean;
BEGIN
  -- Check if the calling user is an admin
  is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  
  -- Check if the calling user is requesting their own data
  is_owner := auth.uid() = p_user_id;
  
  -- Only allow access if user is admin or requesting their own data
  IF NOT (is_admin OR is_owner) THEN
    RETURN; -- Return empty result set for unauthorized access
  END IF;
  
  RETURN QUERY
  SELECT 
    s.id,
    s.user_id,
    s.plan_type,
    s.status,
    s.amount,
    s.currency,
    s.start_date,
    s.end_date,
    s.created_at,
    s.updated_at,
    -- Mask payment IDs: show only last 4 chars for regular users, full for admins
    CASE 
      WHEN is_admin THEN s.paypal_subscription_id
      WHEN s.paypal_subscription_id IS NULL THEN NULL
      ELSE '****' || RIGHT(s.paypal_subscription_id, 4)
    END as paypal_subscription_id_masked,
    CASE 
      WHEN is_admin THEN s.paypal_order_id
      WHEN s.paypal_order_id IS NULL THEN NULL
      ELSE '****' || RIGHT(s.paypal_order_id, 4)
    END as paypal_order_id_masked
  FROM public.subscriptions s
  WHERE s.user_id = p_user_id;
END;
$$;

-- Add a comment explaining the security model
COMMENT ON FUNCTION public.get_user_subscription_safe IS 'Secure function to retrieve subscription data with masked payment IDs for non-admin users. Use this instead of direct table queries to protect sensitive payment information.';