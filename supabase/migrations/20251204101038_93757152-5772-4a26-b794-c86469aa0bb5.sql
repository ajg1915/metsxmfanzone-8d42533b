-- Create standings table
CREATE TABLE public.team_standings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name text NOT NULL,
  division text NOT NULL DEFAULT 'NL East',
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  games_back text NOT NULL DEFAULT '-',
  position integer NOT NULL DEFAULT 1,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create team leaders table
CREATE TABLE public.team_leaders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  player_name text NOT NULL,
  stat_value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_leaders ENABLE ROW LEVEL SECURITY;

-- Standings policies
CREATE POLICY "Anyone can view standings" ON public.team_standings FOR SELECT USING (true);
CREATE POLICY "Admins can manage standings" ON public.team_standings FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Leaders policies
CREATE POLICY "Anyone can view team leaders" ON public.team_leaders FOR SELECT USING (true);
CREATE POLICY "Admins can manage team leaders" ON public.team_leaders FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial NL East standings
INSERT INTO public.team_standings (team_name, division, wins, losses, games_back, position) VALUES
  ('Mets', 'NL East', 45, 32, '-', 1),
  ('Braves', 'NL East', 43, 34, '2.0', 2),
  ('Phillies', 'NL East', 42, 35, '3.0', 3),
  ('Marlins', 'NL East', 35, 42, '10.0', 4),
  ('Nationals', 'NL East', 30, 47, '15.0', 5);

-- Insert initial team leaders
INSERT INTO public.team_leaders (category, player_name, stat_value) VALUES
  ('AVG', 'Lindor', '.312'),
  ('HR', 'Alonso', '24'),
  ('RBI', 'Alonso', '58');