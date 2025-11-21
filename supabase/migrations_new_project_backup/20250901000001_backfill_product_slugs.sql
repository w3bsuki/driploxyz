-- Backfill product slugs for existing products without slugs
-- This migration safely adds slugs to products that don't have them

-- Create a function to generate URL-friendly slugs
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Return early if input is null or empty
    IF input_text IS NULL OR TRIM(input_text) = '' THEN
        RETURN 'product-' || LOWER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8));
    END IF;
    
    -- Generate basic slug
    slug := LOWER(TRIM(input_text));
    -- Replace special characters and spaces with hyphens
    slug := REGEXP_REPLACE(slug, '[^a-z0-9\s\-_]', '', 'g');
    -- Replace multiple spaces/underscores with single hyphen
    slug := REGEXP_REPLACE(slug, '[\s_]+', '-', 'g');
    -- Replace multiple hyphens with single hyphen
    slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
    -- Remove leading/trailing hyphens
    slug := REGEXP_REPLACE(slug, '^-+|-+$', '', 'g');
    
    -- Ensure minimum length
    IF LENGTH(slug) < 3 THEN
        slug := 'item-' || LOWER(SUBSTRING(gen_random_uuid()::TEXT, 1, 6));
    END IF;
    
    -- Limit length to 60 characters
    IF LENGTH(slug) > 60 THEN
        slug := SUBSTRING(slug, 1, 60);
        -- Remove trailing hyphen if created by truncation
        slug := REGEXP_REPLACE(slug, '-$', '');
    END IF;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- Create a function to generate unique slugs with collision handling
CREATE OR REPLACE FUNCTION generate_unique_slug(input_text TEXT, exclude_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
    random_suffix TEXT;
BEGIN
    -- Generate base slug
    base_slug := generate_slug(input_text);
    final_slug := base_slug;
    
    -- Check for reserved words and add suffix if found
    IF final_slug IN (
        'api', 'auth', 'category', 'search', 'signup', 'login', 'logout', 'profile', 
        'wishlist', 'checkout', 'terms', 'privacy', 'admin', 'dashboard', 'sell', 
        'favorites', 'onboarding', 'welcome', 'settings', 'upgrade', 'orders',
        'subscriptions', 'webhooks', 'payments', 'uploads', 'images', 'notifications',
        'about', 'contact', 'help', 'support', 'faq', 'legal', 'cookies',
        'www', 'test', 'staging', 'dev', 'production', 'demo'
    ) THEN
        random_suffix := LOWER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));
        final_slug := base_slug || '-' || random_suffix;
    END IF;
    
    -- Handle collisions with existing slugs
    WHILE EXISTS (
        SELECT 1 FROM products 
        WHERE slug = final_slug 
        AND (exclude_id IS NULL OR id != exclude_id)
    ) AND counter <= 10 LOOP
        -- Generate random suffix for collision resolution
        random_suffix := LOWER(SUBSTRING(gen_random_uuid()::TEXT FROM 1 FOR 6));
        final_slug := SUBSTRING(base_slug, 1, 53) || '-' || random_suffix; -- 53 + 1 + 6 = 60
        counter := counter + 1;
    END LOOP;
    
    -- Fallback if still not unique
    IF EXISTS (
        SELECT 1 FROM products 
        WHERE slug = final_slug 
        AND (exclude_id IS NULL OR id != exclude_id)
    ) THEN
        final_slug := 'product-' || LOWER(SUBSTRING(gen_random_uuid()::TEXT, 1, 12));
    END IF;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Backfill slugs for products without them
DO $$ 
DECLARE
    product_record RECORD;
    new_slug TEXT;
    processed_count INTEGER := 0;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Starting product slug backfill...';
    
    -- Process products without slugs in batches
    FOR product_record IN 
        SELECT id, title 
        FROM products 
        WHERE slug IS NULL OR TRIM(slug) = ''
        ORDER BY created_at ASC
    LOOP
        processed_count := processed_count + 1;
        
        -- Generate unique slug for this product
        BEGIN
            new_slug := generate_unique_slug(product_record.title, product_record.id);
            
            -- Update the product
            UPDATE products 
            SET slug = new_slug 
            WHERE id = product_record.id;
            
            updated_count := updated_count + 1;
            
            -- Log progress every 100 products
            IF processed_count % 100 = 0 THEN
                RAISE NOTICE 'Processed % products, updated % so far...', processed_count, updated_count;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error processing product %: %', product_record.id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Backfill complete! Processed % products, updated % products.', processed_count, updated_count;
END $$;

-- Create index on slug for better performance if it doesn't exist
CREATE INDEX  IF NOT EXISTS products_slug_idx ON products(slug);

-- Add a unique constraint on slug to prevent future duplicates
-- Note: This will fail if there are still duplicate slugs after backfill
DO $$ 
BEGIN
    -- Check if constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'products_slug_unique'
    ) THEN
        ALTER TABLE products ADD CONSTRAINT products_slug_unique UNIQUE (slug);
        RAISE NOTICE 'Added unique constraint on products.slug';
    ELSE
        RAISE NOTICE 'Unique constraint on products.slug already exists';
    END IF;
EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE 'Cannot add unique constraint - duplicate slugs still exist. Please run duplicate cleanup first.';
WHEN OTHERS THEN
    RAISE NOTICE 'Error adding unique constraint: %', SQLERRM;
END $$;

-- Clean up temporary functions (keep them for future use)
-- DROP FUNCTION IF EXISTS generate_slug(TEXT);
-- DROP FUNCTION IF EXISTS generate_unique_slug(TEXT, UUID);

COMMENT ON FUNCTION generate_slug(TEXT) IS 'Generate URL-friendly slug from text';
COMMENT ON FUNCTION generate_unique_slug(TEXT, UUID) IS 'Generate unique slug with collision handling';
