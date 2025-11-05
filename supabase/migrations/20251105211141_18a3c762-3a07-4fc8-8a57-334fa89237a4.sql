-- Create live_notifications table
CREATE TABLE public.live_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message text NOT NULL,
  link_url text NOT NULL DEFAULT '/mlb-network',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active notifications"
ON public.live_notifications
FOR SELECT
USING (is_active = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Admins can insert notifications"
ON public.live_notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update notifications"
ON public.live_notifications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete notifications"
ON public.live_notifications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_live_notifications_updated_at
BEFORE UPDATE ON public.live_notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();