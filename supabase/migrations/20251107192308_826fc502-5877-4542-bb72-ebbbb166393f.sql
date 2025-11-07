-- Make community_images bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'community_images';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view community images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own community images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own community images" ON storage.objects;

-- Create RLS policies for community_images bucket
CREATE POLICY "Users can view community images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'community_images');

CREATE POLICY "Users can upload their own community images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'community_images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own community images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'community_images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);