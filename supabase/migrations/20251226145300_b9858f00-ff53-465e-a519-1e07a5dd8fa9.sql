-- Add referrer_source column to track how visitors found the website
ALTER TABLE public.realtime_presence 
ADD COLUMN IF NOT EXISTS referrer_source TEXT DEFAULT 'direct';

-- Create index for referrer source analytics
CREATE INDEX IF NOT EXISTS idx_presence_referrer_source ON public.realtime_presence(referrer_source);