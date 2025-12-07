-- Add audio_url column to blog_posts table for article audio
ALTER TABLE public.blog_posts 
ADD COLUMN audio_url text;