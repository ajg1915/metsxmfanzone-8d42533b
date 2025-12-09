-- Remove the insecure policy that allows users to update their own subscriptions
-- This prevents users from self-escalating their plan_type or status
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.subscriptions;

-- Note: Admin UPDATE policy remains intact for legitimate admin operations
-- All user subscription updates now must go through edge functions (verify-helcim-payment, verify-paypal-payment)
-- which use SERVICE_ROLE_KEY with proper payment verification