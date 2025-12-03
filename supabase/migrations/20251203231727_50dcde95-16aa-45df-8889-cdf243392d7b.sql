-- Add phone number and SMS opt-in columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number text,
ADD COLUMN IF NOT EXISTS sms_notifications_enabled boolean DEFAULT false;