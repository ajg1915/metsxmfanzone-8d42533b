-- Add blog post link capability to hero slides
ALTER TABLE public.hero_slides 
ADD COLUMN blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
ADD COLUMN link_url TEXT,
ADD COLUMN link_text TEXT DEFAULT 'Read More';