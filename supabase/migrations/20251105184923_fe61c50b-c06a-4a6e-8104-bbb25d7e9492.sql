-- Create app role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create posts table for community
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- RLS policies for posts
CREATE POLICY "Anyone can view posts"
ON public.posts
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create posts"
ON public.posts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.posts
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any post"
ON public.posts
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at on posts
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('community_images', 'community_images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('content_uploads', 'content_uploads', true);

-- Storage policies for community_images
CREATE POLICY "Anyone can view community images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'community_images');

CREATE POLICY "Authenticated users can upload community images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'community_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own community images"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'community_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'community_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for content_uploads (admin only)
CREATE POLICY "Anyone can view content uploads"
ON storage.objects
FOR SELECT
USING (bucket_id = 'content_uploads');

CREATE POLICY "Admins can upload content"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'content_uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update content"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'content_uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete content"
ON storage.objects
FOR DELETE
USING (bucket_id = 'content_uploads' AND public.has_role(auth.uid(), 'admin'));