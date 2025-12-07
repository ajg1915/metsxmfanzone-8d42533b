
-- Fix additional security issues

-- 1. Ensure newsletter_subscribers has proper RLS to block public reads
-- The anon INSERT policy is fine for signups, but we need to ensure no SELECT access for non-admins
-- Drop and recreate to ensure clean state
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON public.newsletter_subscribers;

-- Allow anon users to subscribe (INSERT only)
CREATE POLICY "Anon users can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 2. Fix business_ads_public view - ensure it doesn't expose contact info
-- The view already excludes contact_email and contact_phone, but let's verify with proper security
DROP VIEW IF EXISTS public.business_ads_public;

CREATE VIEW public.business_ads_public AS
SELECT 
    id,
    business_name,
    ad_title,
    ad_description,
    ad_image_url,
    website_url,
    status,
    published_at,
    created_at
FROM public.business_ads
WHERE status = 'approved';

-- 3. Strengthen feedbacks table - only show user's own feedback or admin can see all
DROP POLICY IF EXISTS "Authenticated users can view feedbacks" ON public.feedbacks;

CREATE POLICY "Users can view their own feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Strengthen activity_logs - prevent users from reading any logs
DROP POLICY IF EXISTS "Users can view their own logs" ON public.activity_logs;

-- Only admins can view logs (already exists, just confirming)

-- 5. Ensure subscriptions are properly isolated
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 6. Ensure notification_subscriptions are properly isolated
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.notification_subscriptions;

CREATE POLICY "Users can view their own notification subscriptions"
ON public.notification_subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
