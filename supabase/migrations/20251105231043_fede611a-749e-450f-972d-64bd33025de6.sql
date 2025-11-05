-- Create feedbacks table
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- Create policies for feedbacks
CREATE POLICY "Anyone can view feedbacks"
ON public.feedbacks
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create feedbacks"
ON public.feedbacks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedbacks"
ON public.feedbacks
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own feedbacks"
ON public.feedbacks
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_feedbacks_updated_at
BEFORE UPDATE ON public.feedbacks
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Enable realtime for feedbacks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.feedbacks;