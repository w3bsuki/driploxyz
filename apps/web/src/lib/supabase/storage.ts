import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

async function optimizeImageToWebP(file: File, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      try {
        // Calculate dimensions - max 1200px for product images
        const maxDimension = 1200;
        let { width, height } = img;
        
        if (width > maxDimension || height > maxDimension) {
          const scale = maxDimension / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Use better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert to WebP'));
              return;
            }
            resolve(blob);
          },
          'image/webp',
          quality
        );
      } catch (error) {
        reject(error);
      } finally {
        // Clean up
        URL.revokeObjectURL(img.src);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  try {
    // ALWAYS convert to WebP to save bandwidth
    const webpBlob = await optimizeImageToWebP(file);
    
    // Generate unique filename with .webp extension
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${timestamp}-${randomId}.webp`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
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
    // If WebP conversion fails, don't fall back - fix the issue
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
      // Continue with other images instead of stopping completely
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
    // Optimize avatar to WebP for consistency and bandwidth savings
    const webpBlob = await optimizeImageToWebP(file, 0.9); // Higher quality for avatars
    
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
      throw new Error('Avatar upload succeeded but no path returned');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
    
    return url;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Avatar upload failed');
  }
}