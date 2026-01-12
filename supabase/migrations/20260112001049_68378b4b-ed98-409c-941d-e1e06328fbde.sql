-- Create table for daily player talent assessments
CREATE TABLE public.daily_talent_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  player_id INTEGER,
  player_image_url TEXT,
  position TEXT,
  overall_grade TEXT NOT NULL, -- A+, A, A-, B+, B, B-, C+, C, C-, D, F
  hitting_grade TEXT,
  fielding_grade TEXT,
  power_grade TEXT,
  speed_grade TEXT,
  arm_grade TEXT,
  pitching_grade TEXT, -- For pitchers
  opinion TEXT NOT NULL, -- Anthony's opinion
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_talent_assessments ENABLE ROW LEVEL SECURITY;

-- Public can read assessments
CREATE POLICY "Public can read talent assessments"
ON public.daily_talent_assessments
FOR SELECT
TO anon, authenticated
USING (true);

-- Admins can manage assessments
CREATE POLICY "Admins can manage talent assessments"
ON public.daily_talent_assessments
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for date lookups
CREATE INDEX idx_talent_assessments_date ON public.daily_talent_assessments(assessment_date DESC);

-- Add trigger for updated_at
CREATE TRIGGER update_talent_assessments_updated_at
BEFORE UPDATE ON public.daily_talent_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();