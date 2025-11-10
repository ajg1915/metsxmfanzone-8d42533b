-- Create TV schedules table
CREATE TABLE public.tv_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  network TEXT NOT NULL,
  show_title TEXT NOT NULL,
  description TEXT,
  time_slot TEXT NOT NULL,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tv_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view TV schedules"
ON public.tv_schedules
FOR SELECT
USING (true);

CREATE POLICY "Admins can create TV schedules"
ON public.tv_schedules
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update TV schedules"
ON public.tv_schedules
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete TV schedules"
ON public.tv_schedules
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for timestamps
CREATE TRIGGER update_tv_schedules_updated_at
BEFORE UPDATE ON public.tv_schedules
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();