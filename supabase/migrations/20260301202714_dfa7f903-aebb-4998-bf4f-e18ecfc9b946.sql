
-- Table to track 48-hour review request emails sent to paid subscribers
CREATE TABLE public.review_request_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicate emails per subscription
ALTER TABLE public.review_request_emails ADD CONSTRAINT unique_review_per_subscription UNIQUE (subscription_id);

-- Enable RLS
ALTER TABLE public.review_request_emails ENABLE ROW LEVEL SECURITY;

-- Admins can manage
CREATE POLICY "Admins can manage review emails"
ON public.review_request_emails
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can view their own
CREATE POLICY "Users can view own review emails"
ON public.review_request_emails
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
