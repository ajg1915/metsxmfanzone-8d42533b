ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS pinned_at timestamp with time zone;