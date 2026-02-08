-- Create table to track sent notifications (prevents duplicate emails)
CREATE TABLE IF NOT EXISTS public.subscription_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  notification_type text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  email_sent_to text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, notification_type)
);

-- Enable RLS
ALTER TABLE public.subscription_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notification history
CREATE POLICY "Admins can view all notifications"
ON public.subscription_notifications
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own notification history
CREATE POLICY "Users can view own notifications"
ON public.subscription_notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;