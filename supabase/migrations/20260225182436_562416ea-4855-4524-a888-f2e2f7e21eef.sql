
-- Replace the trigger function to call the edge function instead of Resend directly
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  supabase_url text := 'https://clwghkbtkofacsjeyrtk.supabase.co';
  service_key text;
BEGIN
  -- Get the service role key from vault or use the anon key
  service_key := current_setting('request.headers', true)::json->>'authorization';
  
  -- Call the edge function via net.http_post
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/notify-admin-new-member',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNsd2doa2J0a29mYWNzamV5cnRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTI3NDIsImV4cCI6MjA3NzkyODc0Mn0.11mr9r-U-BAwy9Mmr2yrzjLhjljswgOotJeOOXyfllc'
    ),
    body := jsonb_build_object(
      'userId', NEW.user_id,
      'planType', NEW.plan_type,
      'amount', COALESCE('$' || NEW.amount::text, '$0.00'),
      'source', 'Database Trigger'
    )
  );

  RETURN NEW;
END;
$$;
