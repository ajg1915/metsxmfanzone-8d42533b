-- Remove category column and add assigned_pages
ALTER TABLE public.live_streams DROP COLUMN category;

-- Add assigned_pages column as text array
ALTER TABLE public.live_streams ADD COLUMN assigned_pages TEXT[] DEFAULT ARRAY[]::TEXT[];