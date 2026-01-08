-- Add display_name column to feedbacks table for custom names
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS display_name TEXT;