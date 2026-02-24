
-- Add missing UPDATE policy for media_library storage bucket
CREATE POLICY "Admins can update media"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'media_library' AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
))
WITH CHECK (bucket_id = 'media_library' AND EXISTS (
  SELECT 1 FROM user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'::app_role
));
