-- Create morning predictions job (6:00 AM EST = 11:00 UTC)
SELECT cron.schedule(
  'generate-daily-predictions-morning',
  '0 11 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://clwghkbtkofacsjeyrtk.supabase.co/functions/v1/generate-daily-predictions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd2doa2J0a29mYWNzamV5cnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTI3NDIsImV4cCI6MjA3NzkyODc0Mn0.11mr9r-U-BAwy9Mmr2yrzjLhjljswgOotJeOOXyfllc'
      ),
      body := '{"forceRegenerate": true, "triggerType": "morning"}'::jsonb
    );
  $$
);

-- Create pre-game predictions job (5:00 PM EST = 22:00 UTC for evening games)
SELECT cron.schedule(
  'generate-daily-predictions-pregame',
  '0 22 * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://clwghkbtkofacsjeyrtk.supabase.co/functions/v1/generate-daily-predictions',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd2doa2J0a29mYWNzamV5cnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTI3NDIsImV4cCI6MjA3NzkyODc0Mn0.11mr9r-U-BAwy9Mmr2yrzjLhjljswgOotJeOOXyfllc'
      ),
      body := '{"forceRegenerate": true, "triggerType": "pregame"}'::jsonb
    );
  $$
);