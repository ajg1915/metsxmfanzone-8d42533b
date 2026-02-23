-- Add tables to realtime publication (skip already-added ones)
DO $$
BEGIN
  -- Only add if not already a member
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'hero_slides') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.hero_slides;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'stories') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stories;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'live_notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_notifications;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'stream_alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.stream_alerts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'blog_posts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'game_alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.game_alerts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'podcast_shows') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.podcast_shows;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'mets_news_tracker') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mets_news_tracker;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'podcast_live_stream') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.podcast_live_stream;
  END IF;
END $$;