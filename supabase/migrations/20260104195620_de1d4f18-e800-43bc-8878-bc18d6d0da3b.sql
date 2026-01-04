-- Add new check constraint with all valid types including the new ones
ALTER TABLE public.mets_news_tracker ADD CONSTRAINT mets_news_tracker_type_check 
CHECK (type IN ('signing', 'injury', 'trade', 'rumor', 'update', 'trade_talks', 'discussions', 'update_news'));