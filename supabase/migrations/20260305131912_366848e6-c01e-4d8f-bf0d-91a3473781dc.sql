DROP TRIGGER IF EXISTS update_talent_assessments_updated_at ON public.daily_talent_assessments;
DROP INDEX IF EXISTS idx_talent_assessments_date;
DROP POLICY IF EXISTS "Public can read talent assessments" ON public.daily_talent_assessments;
DROP POLICY IF EXISTS "Admins can manage talent assessments" ON public.daily_talent_assessments;
DROP POLICY IF EXISTS "Public Read Access" ON public.daily_talent_assessments;
DROP POLICY IF EXISTS "Authenticated Manage" ON public.daily_talent_assessments;
DROP TABLE IF EXISTS public.daily_talent_assessments;