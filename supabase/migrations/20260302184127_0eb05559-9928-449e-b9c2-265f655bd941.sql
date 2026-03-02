
-- Create shop_products table
CREATE TABLE public.shop_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  compare_at_price NUMERIC,
  image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'General',
  condition TEXT DEFAULT 'New',
  stock_quantity INTEGER DEFAULT 1,
  weight_oz NUMERIC,
  requires_shipping BOOLEAN DEFAULT true,
  published BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage shop products"
ON public.shop_products FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view published shop products"
ON public.shop_products FOR SELECT
USING (published = true);

-- Create shop_orders table
CREATE TABLE public.shop_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.shop_products(id) ON DELETE SET NULL,
  user_id UUID,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paypal_order_id TEXT,
  paypal_capture_id TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'US',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.shop_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all orders"
ON public.shop_orders FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own orders"
ON public.shop_orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create orders"
ON public.shop_orders FOR INSERT
WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_shop_products_updated_at
BEFORE UPDATE ON public.shop_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shop_orders_updated_at
BEFORE UPDATE ON public.shop_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
