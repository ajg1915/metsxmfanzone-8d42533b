-- Add location column to feedbacks table
ALTER TABLE public.feedbacks ADD COLUMN IF NOT EXISTS location TEXT;