-- Make send_welcome_email_trigger a no-op to avoid blocking signups
CREATE OR REPLACE FUNCTION public.send_welcome_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Temporarily disable external HTTP call to avoid signup failures
  -- You can reintroduce the email-sending logic later via a safe background job.
  RETURN NEW;
END;
$function$;