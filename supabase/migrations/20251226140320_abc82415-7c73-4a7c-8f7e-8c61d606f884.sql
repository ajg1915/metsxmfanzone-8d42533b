-- Create table for real-time presence tracking
CREATE TABLE public.realtime_presence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL UNIQUE,
  current_page TEXT NOT NULL,
  page_type TEXT DEFAULT 'general',
  user_agent TEXT,
  is_authenticated BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for blog view tracking
CREATE TABLE public.blog_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for stream view tracking
CREATE TABLE public.stream_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.realtime_presence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_views ENABLE ROW LEVEL SECURITY;

-- Allow public inserts/updates for presence tracking (anonymous tracking)
CREATE POLICY "Anyone can insert presence" ON public.realtime_presence FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own presence" ON public.realtime_presence FOR UPDATE USING (true);
CREATE POLICY "Admins can view all presence" ON public.realtime_presence FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Anyone can delete own presence" ON public.realtime_presence FOR DELETE USING (true);

-- Blog views policies
CREATE POLICY "Anyone can insert blog views" ON public.blog_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all blog views" ON public.blog_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Stream views policies
CREATE POLICY "Anyone can insert stream views" ON public.stream_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all stream views" ON public.stream_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Enable realtime for presence table
ALTER PUBLICATION supabase_realtime ADD TABLE public.realtime_presence;

-- Create index for faster queries
CREATE INDEX idx_realtime_presence_last_seen ON public.realtime_presence(last_seen_at);
CREATE INDEX idx_realtime_presence_page_type ON public.realtime_presence(page_type);
CREATE INDEX idx_blog_views_blog_post_id ON public.blog_views(blog_post_id);
CREATE INDEX idx_stream_views_stream_id ON public.stream_views(stream_id);

-- Function to clean up stale presence records (older than 5 minutes)
CREATE OR REPLACE FUNCTION public.cleanup_stale_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.realtime_presence 
  WHERE last_seen_at < now() - interval '5 minutes';
END;
$$;