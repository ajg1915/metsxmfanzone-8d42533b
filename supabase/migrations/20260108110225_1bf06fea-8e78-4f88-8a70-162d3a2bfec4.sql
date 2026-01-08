-- Create podcaster applications table
CREATE TABLE public.podcaster_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  experience TEXT,
  podcast_topic TEXT NOT NULL,
  sample_url TEXT,
  equipment_description TEXT,
  availability TEXT,
  social_links TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.podcaster_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own podcaster applications" 
ON public.podcaster_applications 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can insert their own applications
CREATE POLICY "Users can insert own podcaster applications" 
ON public.podcaster_applications 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Admins can view all applications
CREATE POLICY "Admins can view all podcaster applications" 
ON public.podcaster_applications 
FOR SELECT 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications
CREATE POLICY "Admins can update podcaster applications" 
ON public.podcaster_applications 
FOR UPDATE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete applications
CREATE POLICY "Admins can delete podcaster applications" 
ON public.podcaster_applications 
FOR DELETE 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_podcaster_applications_updated_at
BEFORE UPDATE ON public.podcaster_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();