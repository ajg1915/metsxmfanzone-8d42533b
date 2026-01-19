-- Add thumbnail_gif_url column to videos table for animated GIF previews
ALTER TABLE public.videos ADD COLUMN IF NOT EXISTS thumbnail_gif_url TEXT;