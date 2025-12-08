-- Make content_uploads bucket public so images can be displayed
UPDATE storage.buckets SET public = true WHERE id = 'content_uploads';