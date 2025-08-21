import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Optimize image for upload - resize and compress
 */
async function optimizeImage(file: File): Promise<{ blob: Blob; extension: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    
    // Clean up object URL when done
    let objectUrl: string | null = null;
    
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };
    
    img.onload = async () => {
      try {
        // Calculate new dimensions (max 1920px for better performance)
        const maxSize = 1920;
        let width = img.width;
        let height = img.height;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // Use better image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try WebP first with timeout
        const webpPromise = new Promise<Blob | null>((res) => {
          const timeout = setTimeout(() => res(null), 3000); // 3 second timeout
          canvas.toBlob(
            (blob) => {
              clearTimeout(timeout);
              res(blob);
            },
            'image/webp',
            0.85
          );
        });
        
        const webpBlob = await webpPromise;
        
        if (webpBlob) {
          cleanup();
          resolve({ blob: webpBlob, extension: 'webp' });
        } else {
          // Fallback to JPEG if WebP fails
          canvas.toBlob(
            (blob) => {
              cleanup();
              if (blob) {
                resolve({ blob, extension: 'jpg' });
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            'image/jpeg',
            0.85
          );
        }
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    
    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image'));
    };
    
    objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
}

/**
 * Upload a single image to Supabase Storage
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  console.log(`🚀 Starting upload for ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
  
  try {
    let fileToUpload: Blob = file;
    let fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    let contentType = file.type;
    
    // Optimize images (compress and convert to WebP when possible)
    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
      // Skip optimization for SVGs and already optimized WebP
      if (!file.type.includes('webp') || file.size > 500000) { // Optimize if not WebP or larger than 500KB
        console.log('🔄 Attempting to optimize image...');
        
        try {
          // Add a global timeout for optimization
          const optimizationPromise = optimizeImage(file);
          const timeoutPromise = new Promise<typeof optimizationPromise>((_, reject) => 
            setTimeout(() => reject(new Error('Optimization timeout')), 5000)
          );
          
          const optimized = await Promise.race([optimizationPromise, timeoutPromise]) as Awaited<typeof optimizationPromise>;
          fileToUpload = optimized.blob;
          fileExtension = optimized.extension;
          contentType = optimized.extension === 'webp' ? 'image/webp' : 'image/jpeg';
          
          // Log optimization success
          const sizeDiff = ((file.size - fileToUpload.size) / file.size * 100).toFixed(1);
          console.log(`✅ Image optimized: ${(file.size / 1024).toFixed(1)} KB → ${(fileToUpload.size / 1024).toFixed(1)} KB (${sizeDiff}% reduction)`);
        } catch (error) {
          console.warn('⚠️ Image optimization failed or timed out, using original:', error);
          // Fall back to original file
        }
      } else {
        console.log('⏭️ Skipping optimization (already WebP or small size)');
      }
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${timestamp}-${randomId}.${fileExtension}`;
    
    console.log(`📂 Uploading to Supabase bucket "${bucket}": ${fileName}`);
    console.log(`📋 File details: ${(fileToUpload.size / 1024).toFixed(1)} KB, type: ${contentType}`);
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) {
      console.error('❌ Supabase upload error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        statusCode: (error as any)?.statusCode,
        details: (error as any)?.details
      });
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    console.log('📤 Supabase upload successful, data:', data);
    
    // Get public URL
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    
    console.log(`✅ Upload complete - URL: ${url}`);
    
    return {
      url,
      path: data.path
    };
  } catch (error) {
    console.error('Image upload failed:', error);
    throw error;
  }
}

/**
 * Upload multiple images to Supabase Storage
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
    try {
      const uploaded = await uploadImage(supabase, files[i], bucket, userId);
      uploadedImages.push(uploaded);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      // Continue with other uploads even if one fails
    }
  }
  
  if (uploadedImages.length === 0) {
    throw new Error('Failed to upload any images');
  }
  
  return uploadedImages;
}

/**
 * Delete an image from Supabase Storage
 */
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

/**
 * Delete multiple images from Supabase Storage
 */
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

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  try {
    let fileToUpload: Blob = file;
    let fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    let contentType = file.type;
    
    // Optimize avatar images (smaller size for avatars)
    if (file.type.startsWith('image/') && !file.type.includes('svg')) {
      try {
        const optimized = await optimizeImage(file);
        fileToUpload = optimized.blob;
        fileExtension = optimized.extension;
        contentType = optimized.extension === 'webp' ? 'image/webp' : 'image/jpeg';
      } catch (error) {
        console.warn('Avatar optimization failed, using original:', error);
      }
    }
    
    // Generate unique filename for avatar
    const timestamp = Date.now();
    const fileName = `avatars/${userId}/${timestamp}.${fileExtension}`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileToUpload, {
        contentType,
        cacheControl: '3600',
        upsert: true // Allow overwriting existing avatars
      });
    
    if (error) {
      console.error('Avatar upload error:', error);
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }
    
    // Get public URL
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
    
    return url;
  } catch (error) {
    console.error('Avatar upload failed:', error);
    throw error;
  }
}