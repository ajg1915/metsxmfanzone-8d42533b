-- Drop any restrictive policies on blog_posts
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public can view published posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Public Read Access" ON public.blog_posts;
DROP POLICY IF EXISTS "Users can view published posts" ON public.blog_posts;

-- Create a fully public read policy for published blog posts
CREATE POLICY "Public can read published blog posts" 
ON public.blog_posts 
FOR SELECT 
TO anon, authenticated
USING (published = true);

-- Keep the existing writer/admin policies for managing posts
DROP POLICY IF EXISTS "Writers can manage own posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Authenticated Manage" ON public.blog_posts;

-- Writers can manage their own posts
CREATE POLICY "Writers can manage own posts" 
ON public.blog_posts 
FOR ALL 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all posts
DROP POLICY IF EXISTS "Admins can manage all posts" ON public.blog_posts;
CREATE POLICY "Admins can manage all posts" 
ON public.blog_posts 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);