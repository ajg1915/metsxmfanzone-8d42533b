-- Add admin policies for feedback management
CREATE POLICY "Admins can view all feedbacks"
ON public.feedbacks
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete any feedback"
ON public.feedbacks
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));