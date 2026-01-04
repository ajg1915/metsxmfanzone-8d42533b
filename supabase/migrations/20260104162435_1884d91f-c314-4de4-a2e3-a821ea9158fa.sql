-- Add show_watch_live column to hero_slides table
ALTER TABLE public.hero_slides ADD COLUMN IF NOT EXISTS show_watch_live BOOLEAN DEFAULT true;