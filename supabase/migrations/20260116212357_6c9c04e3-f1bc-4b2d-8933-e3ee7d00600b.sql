-- Create polls table
CREATE TABLE public.polls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT false,
  show_as_toast BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls: Everyone can read active polls
CREATE POLICY "Anyone can view active polls" 
ON public.polls 
FOR SELECT 
USING (is_active = true);

-- Polls: Admins can manage all polls
CREATE POLICY "Admins can manage polls" 
ON public.polls 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Poll votes: Anyone can insert a vote (tracked by session or user)
CREATE POLICY "Anyone can vote" 
ON public.poll_votes 
FOR INSERT 
WITH CHECK (true);

-- Poll votes: Anyone can view vote counts
CREATE POLICY "Anyone can view votes" 
ON public.poll_votes 
FOR SELECT 
USING (true);

-- Poll votes: Users can only delete their own votes
CREATE POLICY "Users can delete own votes" 
ON public.poll_votes 
FOR DELETE 
USING (auth.uid() = user_id OR (user_id IS NULL AND session_id IS NOT NULL));

-- Create trigger for updated_at
CREATE TRIGGER update_polls_updated_at
BEFORE UPDATE ON public.polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();