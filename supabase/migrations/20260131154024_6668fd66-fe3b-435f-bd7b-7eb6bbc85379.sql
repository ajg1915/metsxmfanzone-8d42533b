-- Add thumbnail_url column for AI generated or uploaded images
ALTER TABLE public.podcast_shows ADD COLUMN IF NOT EXISTS thumbnail_url text;