
-- Create a function that triggers admin notification on new subscription insert
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  member_email text;
  member_name text;
  admin_emails text[];
  admin_email text;
  safe_plan text;
  safe_amount text;
  logo_url text := 'https://clwghkbtkofacsjeyrtk.supabase.co/storage/v1/object/public/email-assets/logo-192.png';
  dashboard_url text := 'https://metsxmfanzone.com/admin/subscriptions';
  email_html text;
  now_et text;
BEGIN
  -- Get member info
  SELECT email, full_name INTO member_email, member_name
  FROM public.profiles WHERE id = NEW.user_id;

  member_name := COALESCE(member_name, 'Unknown');
  member_email := COALESCE(member_email, 'No email');
  safe_plan := COALESCE(NEW.plan_type, 'free');
  safe_amount := COALESCE('$' || NEW.amount::text, '$0.00');
  now_et := to_char(now() AT TIME ZONE 'America/New_York', 'Mon DD, YYYY HH12:MI AM');

  -- Get admin emails
  SELECT array_agg(p.email) INTO admin_emails
  FROM public.user_roles ur
  JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.role = 'admin' AND p.email IS NOT NULL;

  IF admin_emails IS NULL OR array_length(admin_emails, 1) IS NULL THEN
    RETURN NEW;
  END IF;

  -- Build email
  email_html := '<!DOCTYPE html><html><head><meta charset="utf-8"></head>'
    || '<body style="margin:0;padding:0;background-color:#002D72;font-family:Arial,sans-serif;">'
    || '<div style="max-width:400px;margin:0 auto;padding:20px;">'
    || '<div style="text-align:center;padding:15px 0;">'
    || '<img src="' || logo_url || '" alt="MetsXMFanZone" style="width:85px;height:85px;border-radius:12px;" />'
    || '<h2 style="color:#FF4500;margin:8px 0 0;font-size:18px;">🎉 New Member Alert!</h2></div>'
    || '<div style="background:linear-gradient(180deg,#1a1f2e,#0f1420);border:1px solid rgba(255,69,0,0.3);border-radius:12px;padding:24px;">'
    || '<table style="width:100%;border-collapse:collapse;">'
    || '<tr><td style="padding:8px 0;color:#9CA3AF;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.1);">Member</td>'
    || '<td style="padding:8px 0;color:#F9FAFB;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1);">' || member_name || '</td></tr>'
    || '<tr><td style="padding:8px 0;color:#9CA3AF;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.1);">Email</td>'
    || '<td style="padding:8px 0;color:#F9FAFB;font-size:13px;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1);">' || member_email || '</td></tr>'
    || '<tr><td style="padding:8px 0;color:#9CA3AF;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.1);">Plan</td>'
    || '<td style="padding:8px 0;color:#FF4500;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1);">' || UPPER(safe_plan) || '</td></tr>'
    || '<tr><td style="padding:8px 0;color:#9CA3AF;font-size:13px;border-bottom:1px solid rgba(255,255,255,0.1);">Amount</td>'
    || '<td style="padding:8px 0;color:#10B981;font-size:13px;font-weight:bold;text-align:right;border-bottom:1px solid rgba(255,255,255,0.1);">' || safe_amount || '</td></tr>'
    || '<tr><td style="padding:8px 0;color:#9CA3AF;font-size:13px;">Date</td>'
    || '<td style="padding:8px 0;color:#F9FAFB;font-size:13px;text-align:right;">' || now_et || ' ET</td></tr>'
    || '</table>'
    || '<div style="text-align:center;margin-top:20px;">'
    || '<a href="' || dashboard_url || '" style="display:inline-block;background:linear-gradient(135deg,#FF4500,#FF6A33);color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:13px;">View in Admin Dashboard</a>'
    || '</div></div>'
    || '<p style="color:#6B7280;font-size:10px;text-align:center;margin-top:15px;">© 2026 <span style="color:#FF4500;">MetsXMFanZone</span> — Admin Notification</p>'
    || '</div></body></html>';

  -- Send email to each admin via Resend using net.http_post
  FOREACH admin_email IN ARRAY admin_emails
  LOOP
    PERFORM net.http_post(
      url := 'https://api.resend.com/emails',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.resend_api_key', true),
        'Content-Type', 'application/json'
      ),
      body := jsonb_build_object(
        'from', 'MetsXMFanZone <noreply@metsxmfanzone.com>',
        'to', ARRAY[admin_email],
        'subject', '🎉 New ' || safe_plan || ' Member: ' || member_name || ' — MetsXMFanZone',
        'html', email_html
      )
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create the trigger on subscriptions table
DROP TRIGGER IF EXISTS trigger_notify_admin_new_subscription ON public.subscriptions;
CREATE TRIGGER trigger_notify_admin_new_subscription
AFTER INSERT ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_new_subscription();
