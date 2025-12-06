-- Make content_uploads bucket private (user-submitted business ad images should not be publicly browsable)
UPDATE storage.buckets SET public = false WHERE id = 'content_uploads';

-- Add SELECT policies for content that needs to be viewable
-- Content uploads: only allow viewing approved business ad images via signed URLs or for authenticated users
CREATE POLICY "Anyone can view approved content uploads"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'content_uploads' AND 
  EXISTS (
    SELECT 1 FROM public.business_ads 
    WHERE status = 'approved' 
    AND ad_image_url LIKE '%' || storage.objects.name || '%'
  )
);

-- For videos bucket: keep public for streaming but add policy
CREATE POLICY "Anyone can view published videos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM public.videos 
    WHERE published = true 
    AND (video_url LIKE '%' || storage.objects.name || '%' OR thumbnail_url LIKE '%' || storage.objects.name || '%')
  )
);

-- For podcasts bucket: only published podcasts
CREATE POLICY "Anyone can view published podcasts"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'podcasts' AND
  EXISTS (
    SELECT 1 FROM public.podcasts 
    WHERE published = true 
    AND audio_url LIKE '%' || storage.objects.name || '%'
  )
);

-- For stories bucket: only published stories
CREATE POLICY "Anyone can view published stories"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'stories' AND
  EXISTS (
    SELECT 1 FROM public.stories 
    WHERE published = true 
    AND (media_url LIKE '%' || storage.objects.name || '%' OR thumbnail_url LIKE '%' || storage.objects.name || '%')
  )
);