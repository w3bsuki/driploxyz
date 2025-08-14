-- Fix RLS policies for product creation

-- 1. Products table policies
-- Allow authenticated users to insert their own products
CREATE POLICY "Users can insert their own products" ON products 
  FOR INSERT 
  WITH CHECK (auth.uid() = seller_id);

-- Allow users to view all active products
CREATE POLICY "Users can view active products" ON products 
  FOR SELECT 
  USING (status = 'active' OR seller_id = auth.uid());

-- Allow users to update their own products
CREATE POLICY "Users can update their own products" ON products 
  FOR UPDATE 
  USING (seller_id = auth.uid());

-- Allow users to delete their own products
CREATE POLICY "Users can delete their own products" ON products 
  FOR DELETE 
  USING (seller_id = auth.uid());

-- 2. Product images table policies
-- Allow authenticated users to insert images for their products
CREATE POLICY "Users can insert images for their products" ON product_images 
  FOR INSERT 
  WITH CHECK (
    auth.uid() IN (
      SELECT seller_id FROM products WHERE id = product_id
    )
  );

-- Allow users to view all product images
CREATE POLICY "Users can view product images" ON product_images 
  FOR SELECT 
  USING (true);

-- Allow users to update images for their products
CREATE POLICY "Users can update their product images" ON product_images 
  FOR UPDATE 
  USING (
    auth.uid() IN (
      SELECT seller_id FROM products WHERE id = product_id
    )
  );

-- Allow users to delete images for their products
CREATE POLICY "Users can delete their product images" ON product_images 
  FOR DELETE 
  USING (
    auth.uid() IN (
      SELECT seller_id FROM products WHERE id = product_id
    )
  );

-- 3. Storage bucket policies
-- Allow authenticated users to upload to product-images bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload product images" ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public access to view images
CREATE POLICY "Public can view product images" ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'product-images');

-- Allow users to update their own images
CREATE POLICY "Users can update their product images" ON storage.objects 
  FOR UPDATE 
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete their product images" ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'product-images' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4. Fix promotion_history table if it exists
-- Check if promotion_history table exists and add policy
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'promotion_history') THEN
    -- Allow users to insert their own promotion history
    CREATE POLICY "Users can insert their own promotion history" ON promotion_history 
      FOR INSERT 
      WITH CHECK (auth.uid() = user_id);
      
    -- Allow users to view their own promotion history
    CREATE POLICY "Users can view their own promotion history" ON promotion_history 
      FOR SELECT 
      USING (auth.uid() = user_id);
  END IF;
END $$;