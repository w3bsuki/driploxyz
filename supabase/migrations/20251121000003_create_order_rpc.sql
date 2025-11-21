-- Migration: Create RPC to handle order creation from payment
-- Created: 2025-11-21
-- Description: Atomic order creation and product status update

CREATE OR REPLACE FUNCTION create_order_from_payment(
  p_payment_intent_id text,
  p_amount_total integer, -- in cents
  p_currency text,
  p_buyer_id uuid,
  p_seller_id uuid,
  p_metadata jsonb,
  p_country_code text DEFAULT 'BG'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order_id uuid;
  v_product_id uuid;
  v_is_bundle boolean;
  v_item_ids text[];
  v_item_id text;
  v_existing_order_id uuid;
BEGIN
  -- Check for existing order
  SELECT id INTO v_existing_order_id FROM orders WHERE payment_intent_id = p_payment_intent_id;
  IF v_existing_order_id IS NOT NULL THEN
    RETURN jsonb_build_object('id', v_existing_order_id, 'status', 'already_exists');
  END IF;

  v_product_id := (p_metadata->>'productId')::uuid;
  v_is_bundle := COALESCE((p_metadata->>'isBundle')::boolean, false);

  -- Create Order
  INSERT INTO orders (
    buyer_id,
    seller_id,
    product_id,
    total_amount,
    currency,
    status,
    payment_method,
    payment_intent_id,
    is_bundle,
    items_count,
    country_code,
    created_at,
    updated_at
  ) VALUES (
    p_buyer_id,
    p_seller_id,
    v_product_id,
    p_amount_total / 100.0, -- Convert to decimal
    p_currency,
    'paid', -- Initial status
    'stripe',
    p_payment_intent_id,
    v_is_bundle,
    COALESCE((p_metadata->>'itemCount')::integer, 1),
    p_country_code,
    now(),
    now()
  ) RETURNING id INTO v_order_id;

  -- Handle Bundle Items
  IF v_is_bundle THEN
    v_item_ids := string_to_array(p_metadata->>'itemIds', ',');
    
    FOREACH v_item_id IN ARRAY v_item_ids
    LOOP
      -- Insert Order Item
      -- We get price from products table to ensure accuracy, or could pass it
      INSERT INTO order_items (order_id, product_id, price)
      SELECT v_order_id, id, price
      FROM products WHERE id = v_item_id::uuid;

      -- Mark product as sold
      UPDATE products SET is_sold = true, sold_at = now() WHERE id = v_item_id::uuid;
    END LOOP;
  ELSE
    -- Mark single product as sold
    UPDATE products SET is_sold = true, sold_at = now() WHERE id = v_product_id;
  END IF;

  RETURN jsonb_build_object('id', v_order_id, 'status', 'created');
END;
$$;
