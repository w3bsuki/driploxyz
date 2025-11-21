-- Add unique constraint to ensure one review per order per reviewer
-- This enforces the "one review per order" requirement at the database level

-- First, check if there are any duplicate reviews that would violate the constraint
-- If any exist, we need to handle them before adding the constraint
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count potential duplicates
    SELECT COUNT(*)
    INTO duplicate_count
    FROM (
        SELECT order_id, reviewer_id, COUNT(*)
        FROM public.reviews
        WHERE order_id IS NOT NULL
        GROUP BY order_id, reviewer_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % sets of duplicate reviews that need to be cleaned up', duplicate_count;
        -- Log the duplicates for manual review
        RAISE NOTICE 'Duplicate reviews detected - migration will clean up automatically';
        
        -- Keep only the most recent review for each order+reviewer combination
        DELETE FROM public.reviews
        WHERE id NOT IN (
            SELECT DISTINCT ON (order_id, reviewer_id) id
            FROM public.reviews
            WHERE order_id IS NOT NULL
            ORDER BY order_id, reviewer_id, created_at DESC
        );
    END IF;
    
    RAISE NOTICE 'Reviews table ready for unique constraint';
END $$;

-- Add unique constraint to prevent multiple reviews per order from same reviewer
ALTER TABLE public.reviews
ADD CONSTRAINT unique_review_per_order_reviewer
UNIQUE (order_id, reviewer_id);

-- Add index for performance on common queries
CREATE INDEX IF NOT EXISTS idx_reviews_order_reviewer ON public.reviews(order_id, reviewer_id)
WHERE order_id IS NOT NULL;

-- Update existing RLS policy to be more explicit about the constraint
DROP POLICY IF EXISTS "Users can create reviews" ON public.reviews;
CREATE POLICY "Users can create reviews" ON public.reviews
FOR INSERT WITH CHECK (
  reviewer_id = (SELECT auth.uid())
  AND reviewer_id != reviewee_id -- Can't review yourself
  AND order_id IS NOT NULL -- Must be associated with an order
  AND EXISTS (
    -- Can only review orders where you are buyer or seller
    SELECT 1 FROM public.orders 
    WHERE id = order_id 
    AND (buyer_id = reviewer_id OR seller_id = reviewer_id)
    AND status = 'delivered' -- Only delivered orders can be reviewed
  )
);

-- Add comment for documentation
COMMENT ON CONSTRAINT unique_review_per_order_reviewer ON public.reviews IS 
'Ensures one review per order per reviewer - prevents duplicate reviews';