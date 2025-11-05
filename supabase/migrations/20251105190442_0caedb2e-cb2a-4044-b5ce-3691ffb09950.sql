-- This migration will help you become an admin
-- After running this, you'll need to sign up/login, then run the following query
-- with your actual user email to grant yourself admin access:
-- 
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM public.profiles
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Add a helpful comment
COMMENT ON TABLE public.user_roles IS 'To grant admin access: INSERT INTO public.user_roles (user_id, role) SELECT id, ''admin''::app_role FROM public.profiles WHERE email = ''your-email@example.com'' ON CONFLICT DO NOTHING;';