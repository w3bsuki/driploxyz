import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Convert image to WebP format for bandwidth optimization
 * Following SvelteKit best practices for image handling
 */
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Optimize for 2x display resolution as per SvelteKit docs
        const MAX_WIDTH = 1600; // 800px display * 2
        const MAX_HEIGHT = 1600;
        
        let { width, height } = img;
        
        // Maintain aspect ratio while constraining dimensions
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // High quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to WebP with optimal quality
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              reject(new Error('WebP conversion failed'));
              return;
            }
            resolve(blob);
          },
          'image/webp',
          0.9 // Higher quality for product images
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image loading failed'));
    };

    img.src = objectUrl;
  });
}

/**
 * Upload optimized image to Supabase Storage
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  // Validate input
  if (!file.type.startsWith('image/')) {
    throw new Error('Invalid file type');
  }
  
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size exceeds 10MB limit');
  }

  try {
    // Convert to WebP for optimal delivery
    const webpBlob = await convertToWebP(file);
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${timestamp}-${randomId}.webp`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000', // 1 year cache for immutable assets
        upsert: false
      });
    
    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    if (!data?.path) {
      throw new Error('Upload succeeded but no path returned');
    }
    
    // Construct public URL
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    
    return {
      url,
      path: data.path
    };
  } catch (error) {
    throw error instanceof Error ? error : new Error('Image upload failed');
  }
}

/**
 * Upload multiple images with progress tracking
 */
export async function uploadImages(
  supabase: SupabaseClient,
  files: File[],
  bucket: string = 'product-images',
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImage[]> {
  const uploadedImages: UploadedImage[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const uploaded = await uploadImage(supabase, files[i], bucket, userId);
    uploadedImages.push(uploaded);
    onProgress?.(i + 1, files.length);
  }
  
  if (uploadedImages.length === 0) {
    throw new Error('No images uploaded successfully');
  }
  
  return uploadedImages;
}

/**
 * Delete image from storage
 */
export async function deleteImage(
  supabase: SupabaseClient,
  path: string,
  bucket: string = 'product-images'
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);
  
  return !error;
}

/**
 * Delete multiple images from storage
 */
export async function deleteImages(
  supabase: SupabaseClient,
  paths: string[],
  bucket: string = 'product-images'
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths);
  
  return !error;
}

/**
 * Upload avatar image with optimization
 */
export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Avatar size exceeds 5MB limit');
  }
  
  try {
    const webpBlob = await convertToWebP(file);
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `avatars/${userId}/${timestamp}-${randomId}.webp`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
        cacheControl: '31536000',
        upsert: true
      });
    
    if (error) {
      throw new Error(`Avatar upload failed: ${error.message}`);
    }
    
    if (!data?.path) {
      throw new Error('Avatar upload succeeded but no path returned');
    }
    
    return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Avatar upload failed');
  }
}