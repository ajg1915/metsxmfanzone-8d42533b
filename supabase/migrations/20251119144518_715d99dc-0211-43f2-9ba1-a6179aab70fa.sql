-- Create blog_comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_comments
CREATE POLICY "Anyone can view comments"
ON public.blog_comments
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON public.blog_comments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
ON public.blog_comments
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
ON public.blog_comments
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any comment"
ON public.blog_comments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_blog_comments_updated_at
BEFORE UPDATE ON public.blog_comments
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create live_stream_admin_updates table
CREATE TABLE public.live_stream_admin_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  live_stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL,
  welcome_message TEXT NOT NULL,
  topics TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_stream_admin_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_stream_admin_updates
CREATE POLICY "Anyone can view admin updates"
ON public.live_stream_admin_updates
FOR SELECT
USING (true);

CREATE POLICY "Admins can create updates"
ON public.live_stream_admin_updates
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update updates"
ON public.live_stream_admin_updates
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete updates"
ON public.live_stream_admin_updates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_live_stream_admin_updates_updated_at
BEFORE UPDATE ON public.live_stream_admin_updates
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();