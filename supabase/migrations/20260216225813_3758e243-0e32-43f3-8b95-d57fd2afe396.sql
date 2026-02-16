
-- Add RLS policies for writers to manage their own blog posts

-- Writers can insert their own posts
CREATE POLICY "Writers can insert own posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND public.is_writer(auth.uid())
);

-- Writers can view their own posts (even unpublished)
CREATE POLICY "Writers can view own posts"
ON public.blog_posts
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  AND public.is_writer(auth.uid())
);

-- Writers can update their own posts
CREATE POLICY "Writers can update own posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  AND public.is_writer(auth.uid())
)
WITH CHECK (
  auth.uid() = user_id
  AND public.is_writer(auth.uid())
);
