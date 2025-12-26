-- Add approval_status column to blog_posts for approval workflow
ALTER TABLE public.blog_posts 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved';

-- Update existing posts to be approved by default
UPDATE public.blog_posts SET approval_status = 'approved' WHERE approval_status IS NULL;

-- Create a function to check if user is a writer
CREATE OR REPLACE FUNCTION public.is_writer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'writer'::app_role
  )
$$;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can update posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can delete posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Writers can view own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Writers can create posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Writers can update own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Writers can delete own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public Read Access" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated Manage" ON public.blog_posts;

-- Create new RLS policies
-- Anyone can view approved and published posts
CREATE POLICY "Public can view approved posts" 
ON public.blog_posts 
FOR SELECT 
USING (
  (published = true AND approval_status = 'approved') OR
  auth.uid() = user_id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Writers and admins can insert posts
CREATE POLICY "Writers and admins can create posts" 
ON public.blog_posts 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  (public.is_writer(auth.uid()) OR public.has_role(auth.uid(), 'admin'::app_role))
);

-- Writers can update own posts, admins can update all
CREATE POLICY "Writers update own, admins update all" 
ON public.blog_posts 
FOR UPDATE 
USING (
  (auth.uid() = user_id AND public.is_writer(auth.uid())) OR
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Writers can delete own posts, admins can delete all
CREATE POLICY "Writers delete own, admins delete all" 
ON public.blog_posts 
FOR DELETE 
USING (
  (auth.uid() = user_id AND public.is_writer(auth.uid())) OR
  public.has_role(auth.uid(), 'admin'::app_role)
);