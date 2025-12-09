-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Users can create own subscriptions" ON public.subscriptions;

-- Create a restricted INSERT policy that only allows:
-- 1. Free plan subscriptions (free plans don't need payment)
-- 2. Pending subscriptions (for paid plans, edge functions will update to active after payment)
CREATE POLICY "Users can create own subscriptions safely" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  AND (
    -- Allow free plans with active status
    (plan_type = 'free' AND status = 'active' AND (amount = 0 OR amount IS NULL))
    OR
    -- Allow any plan with pending status (for paid plans before payment verification)
    status = 'pending'
  )
);