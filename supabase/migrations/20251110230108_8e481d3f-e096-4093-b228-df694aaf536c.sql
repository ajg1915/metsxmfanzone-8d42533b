-- Add link_url field to stories table for article links
ALTER TABLE public.stories 
ADD COLUMN link_url text;