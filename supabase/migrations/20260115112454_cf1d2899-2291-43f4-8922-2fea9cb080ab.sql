-- Add blog_post_id column to stories table to link stories to blog posts
ALTER TABLE public.stories ADD COLUMN IF NOT EXISTS blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_stories_blog_post_id ON public.stories(blog_post_id);