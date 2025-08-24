import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Convert image to WebP using Canvas API
 * This MUST work or we reject the upload
 */
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Browser does not support canvas'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Max dimensions for products
        const MAX_SIZE = 1200;
        let { width, height } = img;
        
        // Scale down if needed
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const scale = MAX_SIZE / Math.max(width, height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        // Set canvas size
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error('Failed to create WebP blob'));
              return;
            }
            resolve(blob);
          },
          'image/webp',
          0.85 // 85% quality for good balance
        );
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    // Start loading
    img.src = objectUrl;
  });
}

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Image must be less than 10MB');
    }

    console.log('Converting to WebP...');
    
    // Convert to WebP - REQUIRED
    const webpBlob = await convertToWebP(file);
    
    console.log('WebP conversion done, size:', webpBlob.size);
    
    // Generate filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${timestamp}-${randomId}.webp`;
    
    console.log('Uploading to Supabase...');
    
    // Upload WebP to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    if (!data?.path) {
      throw new Error('No path returned from upload');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    
    console.log('Upload complete:', url);
    
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
      console.log(`Uploading image ${i + 1}/${files.length}`);
      const uploaded = await uploadImage(supabase, files[i], bucket, userId);
      uploadedImages.push(uploaded);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      // If first image fails, throw immediately
      if (i === 0) {
        throw error;
      }
      // Otherwise continue with other images
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
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Avatar must be less than 5MB');
    }
    
    // Convert avatar to WebP
    const webpBlob = await convertToWebP(file);
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `avatars/${userId}/${timestamp}-${randomId}.webp`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
    
    if (!data?.path) {
      throw new Error('No path returned');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
    
    return url;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Avatar upload failed');
  }
}