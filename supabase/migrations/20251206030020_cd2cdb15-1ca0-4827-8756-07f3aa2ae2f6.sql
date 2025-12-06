-- Drop the current overly permissive policy on blog_posts
DROP POLICY IF EXISTS "Anyone can view all blog posts" ON public.blog_posts;

-- Create a new policy that only allows viewing published blog posts
-- Admins can still view all posts via their separate admin policy
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);