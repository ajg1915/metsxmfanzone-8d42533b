
-- Player of the Month entries
CREATE TABLE public.player_of_the_month (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_name TEXT NOT NULL,
  player_image_url TEXT,
  month TEXT NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM now()),
  admin_opinion TEXT NOT NULL,
  created_by UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fan votes
CREATE TABLE public.player_of_the_month_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_of_the_month_id UUID NOT NULL REFERENCES public.player_of_the_month(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  vote_type TEXT NOT NULL DEFAULT 'agree' CHECK (vote_type IN ('agree', 'disagree')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_of_the_month_id, user_id)
);

-- RLS
ALTER TABLE public.player_of_the_month ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_of_the_month_votes ENABLE ROW LEVEL SECURITY;

-- Player of the month policies
CREATE POLICY "Anyone can view active player of the month" ON public.player_of_the_month FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can view all" ON public.player_of_the_month FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage player of the month" ON public.player_of_the_month FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Votes policies
CREATE POLICY "Anyone can view votes" ON public.player_of_the_month_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.player_of_the_month_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own votes" ON public.player_of_the_month_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own votes" ON public.player_of_the_month_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);
