-- Add order_items table to handle multiple items per order
-- This resolves TypeScript errors caused by missing table referenced in stripe service

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    line_total DECIMAL(10,2) GENERATED ALWAYS AS (price * quantity) STORED,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- RLS Policies - order items inherit access from orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Users can select order items for orders they can see
CREATE POLICY "Users can view order items for their orders" ON order_items
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- Users can insert order items for their own orders
CREATE POLICY "Users can insert order items for their orders" ON order_items
    FOR INSERT WITH CHECK (
        order_id IN (
            SELECT id FROM orders
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- Users can update order items for their own orders
CREATE POLICY "Users can update order items for their orders" ON order_items
    FOR UPDATE USING (
        order_id IN (
            SELECT id FROM orders
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- Only buyers and sellers can delete order items
CREATE POLICY "Users can delete order items for their orders" ON order_items
    FOR DELETE USING (
        order_id IN (
            SELECT id FROM orders
            WHERE buyer_id = auth.uid() OR seller_id = auth.uid()
        )
    );

-- Add trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_order_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_order_items_updated_at();