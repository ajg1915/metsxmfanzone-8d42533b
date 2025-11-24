-- Update the check constraint on mets_news_tracker to only allow 'signing' and 'traded' types
ALTER TABLE public.mets_news_tracker 
DROP CONSTRAINT IF EXISTS mets_news_tracker_type_check;

ALTER TABLE public.mets_news_tracker 
ADD CONSTRAINT mets_news_tracker_type_check 
CHECK (type IN ('signing', 'traded'));