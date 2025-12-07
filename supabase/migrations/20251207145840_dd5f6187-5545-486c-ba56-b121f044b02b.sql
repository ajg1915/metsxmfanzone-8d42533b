-- Create a view that masks sensitive payment data for non-admin users
-- This provides an extra layer of protection for payment transaction IDs

-- Create a security definer function to safely get masked subscription data
CREATE OR REPLACE FUNCTION public.get_user_subscription_safe(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  plan_type text,
  status text,
  amount numeric,
  currency text,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  -- Masked payment fields for non-admin users
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
BEGIN
  -- Check if the calling user is an admin
  is_admin := public.has_role(auth.uid(), 'admin'::app_role);
  
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
    -- Mask payment IDs: show only last 4 chars for users, full for admins
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
  WHERE s.user_id = p_user_id
    OR is_admin;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_subscription_safe(uuid) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_subscription_safe IS 'Returns subscription data with masked payment IDs for non-admin users. Admins see full data.';