-- Fix favorites duplicate issue by adding unique constraint
-- This prevents the same user from favoriting the same product multiple times

-- Add unique constraint to prevent duplicate favorites
ALTER TABLE favorites 
ADD CONSTRAINT favorites_user_product_unique 
UNIQUE (user_id, product_id);

-- Clean up any existing duplicates before constraint (if any exist)
-- Keep only the earliest favorite for each user-product pair
DELETE FROM favorites f1
USING favorites f2
WHERE f1.id > f2.id 
  AND f1.user_id = f2.user_id 
  AND f1.product_id = f2.product_id;