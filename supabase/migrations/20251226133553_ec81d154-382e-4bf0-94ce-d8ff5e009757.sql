-- Allow writers to upload to content_uploads bucket (for blog images)
CREATE POLICY "Writers can upload blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'content_uploads' 
  AND (storage.foldername(name))[1] = 'blog-images'
  AND (has_role(auth.uid(), 'writer'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Allow writers to update their own uploaded images
CREATE POLICY "Writers can update blog images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'content_uploads' 
  AND (storage.foldername(name))[1] = 'blog-images'
  AND (has_role(auth.uid(), 'writer'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Allow writers to delete their own uploaded images  
CREATE POLICY "Writers can delete blog images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'content_uploads' 
  AND (storage.foldername(name))[1] = 'blog-images'
  AND (has_role(auth.uid(), 'writer'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);