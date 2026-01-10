
-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to call the edge function for generating predictions
CREATE OR REPLACE FUNCTION public.trigger_daily_predictions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  response_status integer;
BEGIN
  -- Make HTTP request to the edge function
  SELECT status INTO response_status
  FROM http_post(
    'https://clwghkbtkofacsjeyrtk.supabase.co/functions/v1/generate-daily-predictions',
    '{}',
    'application/json'
  );
  
  -- Log the result
  RAISE NOTICE 'Daily predictions trigger completed with status: %', response_status;
END;
$$;

-- Schedule the cron job to run every day at 6:00 AM EST (11:00 UTC)
SELECT cron.schedule(
  'generate-daily-predictions',
  '0 11 * * *',
  $$SELECT public.trigger_daily_predictions()$$
);
