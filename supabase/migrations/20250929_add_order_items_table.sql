-- Add order_items table for tracking individual items in orders (especially bundles)
-- This table provides the audit trail for line items that dashboards rely on

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by order
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Index for fast lookups by product
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- RLS Policies
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Buyers can view their own order items
CREATE POLICY "Buyers can view their order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.buyer_id = auth.uid()
    )
  );

-- Sellers can view order items for their products
CREATE POLICY "Sellers can view their product order items"
  ON public.order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.seller_id = auth.uid()
    )
  );

-- Service role can insert order items (for checkout process)
CREATE POLICY "Service role can insert order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Comment for documentation
COMMENT ON TABLE public.order_items IS 'Line items for orders, critical for bundle orders and revenue reporting';