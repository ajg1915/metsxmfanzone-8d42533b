-- Create social_media_connections table for storing OAuth credentials
CREATE TABLE public.social_media_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'tiktok')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  page_id TEXT,
  page_name TEXT,
  account_username TEXT,
  connected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'disconnected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, platform)
);

-- Enable RLS
ALTER TABLE public.social_media_connections ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view all connections" 
ON public.social_media_connections 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create connections" 
ON public.social_media_connections 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update connections" 
ON public.social_media_connections 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete connections" 
ON public.social_media_connections 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create social_media_posts table for tracking posts
CREATE TABLE public.social_media_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.stories(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'twitter', 'tiktok')),
  external_post_id TEXT,
  external_post_url TEXT,
  caption TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'deleted')),
  error_message TEXT,
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_posts ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admins can view all social posts" 
ON public.social_media_posts 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can create social posts" 
ON public.social_media_posts 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update social posts" 
ON public.social_media_posts 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete social posts" 
ON public.social_media_posts 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_social_media_connections_updated_at
BEFORE UPDATE ON public.social_media_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_media_posts_updated_at
BEFORE UPDATE ON public.social_media_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();