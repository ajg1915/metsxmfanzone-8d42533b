
-- Create toast_prompts table for managing all toast/prompt messages on the site
CREATE TABLE public.toast_prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT 'global',
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'default',
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_condition TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.toast_prompts ENABLE ROW LEVEL SECURITY;

-- Anyone can view active toast prompts (needed for frontend to display them)
CREATE POLICY "Anyone can view active toast prompts"
ON public.toast_prompts
FOR SELECT
USING (true);

-- Admins can manage toast prompts
CREATE POLICY "Admins can manage toast prompts"
ON public.toast_prompts
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_toast_prompts_updated_at
BEFORE UPDATE ON public.toast_prompts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
