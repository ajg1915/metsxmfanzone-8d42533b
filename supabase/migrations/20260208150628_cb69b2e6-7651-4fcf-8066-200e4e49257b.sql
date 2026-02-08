-- Add new fields to subscriptions table for enhanced management
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cancellation_status text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cancellation_requested_at timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS next_payment_date timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS next_payment_amount numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'online',
ADD COLUMN IF NOT EXISTS total_payments_received integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_payment_date timestamptz DEFAULT NULL,
ADD COLUMN IF NOT EXISTS last_payment_amount numeric DEFAULT NULL,
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;

-- Create payment history table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'USD',
  payment_method text NOT NULL DEFAULT 'online',
  payment_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed',
  notes text,
  recorded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create subscription activity log table
CREATE TABLE IF NOT EXISTS public.subscription_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  action text NOT NULL,
  details jsonb DEFAULT '{}',
  performed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_activity ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_payments
CREATE POLICY "Admins can manage all payments"
ON public.subscription_payments
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own payments"
ON public.subscription_payments
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS policies for subscription_activity
CREATE POLICY "Admins can manage all activity"
ON public.subscription_activity
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own activity"
ON public.subscription_activity
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_subscription_payments_updated_at
BEFORE UPDATE ON public.subscription_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for activity tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_activity;