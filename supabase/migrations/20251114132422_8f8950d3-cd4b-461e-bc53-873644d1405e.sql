-- Make all blog posts publicly viewable
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;

CREATE POLICY "Anyone can view all blog posts"
ON public.blog_posts
FOR SELECT
USING (true);