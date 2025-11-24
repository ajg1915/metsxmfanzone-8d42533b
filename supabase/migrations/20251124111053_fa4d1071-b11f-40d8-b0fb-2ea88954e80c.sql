-- Create table for tutorial walkthrough steps
CREATE TABLE public.tutorial_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_number INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutorial_steps ENABLE ROW LEVEL SECURITY;

-- Admins can manage tutorial steps
CREATE POLICY "Admins can manage tutorial steps" 
ON public.tutorial_steps 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view active tutorial steps
CREATE POLICY "Anyone can view active tutorial steps" 
ON public.tutorial_steps 
FOR SELECT 
USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_tutorial_steps_updated_at
BEFORE UPDATE ON public.tutorial_steps
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();