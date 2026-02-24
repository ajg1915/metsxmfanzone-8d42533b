
-- Add is_ai_generated flag to hero_slides
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS is_ai_generated boolean DEFAULT false;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS ai_source_type text;
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS ai_source_id uuid;
