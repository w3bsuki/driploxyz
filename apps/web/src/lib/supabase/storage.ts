import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

// Simple, reliable image upload without client-side optimization
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  try {
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Generate unique filename - keep original extension for now
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${userId}/${timestamp}-${randomId}.${fileExt}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    if (!data?.path) {
      throw new Error('Upload succeeded but no path returned');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    
    return {
      url,
      path: data.path
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error instanceof Error ? error : new Error('Upload failed');
  }
}

export async function uploadImages(
  supabase: SupabaseClient,
  files: File[],
  bucket: string = 'product-images',
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImage[]> {
  const uploadedImages: UploadedImage[] = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const uploaded = await uploadImage(supabase, files[i], bucket, userId);
      uploadedImages.push(uploaded);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      // Continue with other images instead of stopping completely
      if (uploadedImages.length === 0 && i === files.length - 1) {
        // If no images uploaded and this was the last one, throw
        throw error;
      }
    }
  }
  
  if (uploadedImages.length === 0) {
    throw new Error('Failed to upload any images');
  }
  
  return uploadedImages;
}

export async function deleteImage(
  supabase: SupabaseClient,
  path: string,
  bucket: string = 'product-images'
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  if (error) {
    console.error('Delete error:', error);
    return false;
  }
  
  return true;
}

export async function deleteImages(
  supabase: SupabaseClient,
  paths: string[],
  bucket: string = 'product-images'
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);
  
  if (error) {
    console.error('Delete error:', error);
    return false;
  }
  
  return true;
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  try {
    // Check file size (max 2MB for avatars)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error('Avatar size must be less than 2MB');
    }
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `avatars/${userId}/${timestamp}-${randomId}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
    
    if (!data?.path) {
      throw new Error('Avatar upload succeeded but no path returned');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
    
    return url;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Avatar upload failed');
  }
}