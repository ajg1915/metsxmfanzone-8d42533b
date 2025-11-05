-- Create storage bucket for videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for video uploads
CREATE POLICY "Admins can upload videos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'videos' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update videos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'videos' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete videos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'videos' AND
  auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Anyone can view videos"
ON storage.objects
FOR SELECT
USING (bucket_id = 'videos');