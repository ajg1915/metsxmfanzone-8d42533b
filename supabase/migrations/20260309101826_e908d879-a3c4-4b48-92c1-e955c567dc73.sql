
-- Create post_comments table
CREATE TABLE public.post_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('gif', 'video', NULL)),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view comments
CREATE POLICY "Anyone can view comments" ON public.post_comments FOR SELECT USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON public.post_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment" ON public.post_comments FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON public.post_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX idx_post_comments_created_at ON public.post_comments(created_at);
