-- Driplo Marketplace - Storage Buckets Setup
-- Migration: 002_setup_storage_buckets
-- Description: Creates storage buckets for marketplace images

-- NOTE: These need to be created manually in Supabase Dashboard or via CLI
-- as they cannot be created via SQL migrations

/*
STORAGE BUCKETS TO CREATE:

1. product-images (PUBLIC)
   - Purpose: Store product photos
   - Max file size: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - File limit per upload: 10 files

2. profile-avatars (PUBLIC) 
   - Purpose: Store user profile pictures
   - Max file size: 5MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - File limit per upload: 1 file

3. message-attachments (PRIVATE)
   - Purpose: Store images shared in messages
   - Max file size: 10MB
   - Allowed MIME types: image/jpeg, image/png, image/webp
   - File limit per upload: 5 files

BUCKET POLICIES TO IMPLEMENT:

-- Product Images Bucket Policies
-- Allow authenticated users to upload their own product images
CREATE POLICY "Users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to view product images (public bucket)
CREATE POLICY "Anyone can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow product owners to delete their images
CREATE POLICY "Users can delete their product images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'product-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Profile Avatars Bucket Policies  
-- Allow users to upload their own avatar
CREATE POLICY "Users can upload their avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update their avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Message Attachments Bucket Policies
-- Allow authenticated users to upload message attachments
CREATE POLICY "Users can upload message attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow message participants to view attachments
CREATE POLICY "Message participants can view attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'message-attachments'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR auth.uid()::text = (storage.foldername(name))[2]
    )
  );

-- Allow users to delete their own message attachments
CREATE POLICY "Users can delete their message attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'message-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
*/

-- File naming conventions:
-- product-images: {user_id}/{product_id}/{image_id}.{ext}
-- profile-avatars: {user_id}/avatar.{ext}
-- message-attachments: {sender_id}/{receiver_id}/{message_id}_{filename}.{ext}

-- Helper function to get file extension
CREATE OR REPLACE FUNCTION get_file_extension(filename text)
RETURNS text AS $$
BEGIN
    RETURN lower(substring(filename from '\.([^.]*)$'));
END;
$$ LANGUAGE plpgsql;