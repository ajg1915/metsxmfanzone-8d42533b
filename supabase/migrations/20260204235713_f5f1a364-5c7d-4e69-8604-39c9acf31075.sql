-- Create table for AI generated image history
CREATE TABLE public.ai_image_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_edited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.ai_image_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all AI image history
CREATE POLICY "Admins can view all AI image history"
ON public.ai_image_history
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can create AI image history
CREATE POLICY "Admins can create AI image history"
ON public.ai_image_history
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete AI image history
CREATE POLICY "Admins can delete AI image history"
ON public.ai_image_history
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));