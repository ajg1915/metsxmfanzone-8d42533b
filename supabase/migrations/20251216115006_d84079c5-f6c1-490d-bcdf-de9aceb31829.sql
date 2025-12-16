-- Add target_selector column to tutorial_steps for spotlight tour
ALTER TABLE public.tutorial_steps 
ADD COLUMN IF NOT EXISTS target_selector TEXT;

-- Add comment for clarity
COMMENT ON COLUMN public.tutorial_steps.target_selector IS 'CSS selector or element ID to highlight (e.g., #stories-section, .hero-section)';