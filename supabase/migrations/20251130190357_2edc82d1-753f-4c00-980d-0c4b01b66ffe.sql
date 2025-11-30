-- Create trigger function to send welcome email on new profile
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Invoke the send-welcome-email edge function
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on profiles insert
DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_trigger();