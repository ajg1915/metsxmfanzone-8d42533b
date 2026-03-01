
-- Remove the duplicate database trigger and function that sends admin notifications
DROP TRIGGER IF EXISTS trigger_notify_admin_new_subscription ON public.subscriptions;
DROP FUNCTION IF EXISTS public.notify_admin_on_new_subscription() CASCADE;
