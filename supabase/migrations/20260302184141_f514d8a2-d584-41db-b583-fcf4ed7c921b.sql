
-- Tighten the insert policy to require essential fields
DROP POLICY "Anyone can create orders" ON public.shop_orders;
CREATE POLICY "Anyone can create orders with valid data"
ON public.shop_orders FOR INSERT
WITH CHECK (
  product_id IS NOT NULL 
  AND customer_name IS NOT NULL 
  AND customer_email IS NOT NULL
  AND total_amount > 0
);
