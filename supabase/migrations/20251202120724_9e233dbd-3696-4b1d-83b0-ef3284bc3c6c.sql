-- Fix send_welcome_email_trigger to use the correct schema for pg_net
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Invoke the send-welcome-email edge function
  PERFORM extensions.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
    ),
    body := jsonb_build_object('record', to_jsonb(NEW))
  );
  
  RETURN NEW;
END;
$function$;