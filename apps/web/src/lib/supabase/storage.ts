import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Convert image to WebP using Canvas API
 */
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve(file); // Fallback to original
      return;
    }

    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Max 1200px for products
        const MAX_SIZE = 1200;
        let { width, height } = img;
        
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const scale = MAX_SIZE / Math.max(width, height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (!blob) {
              resolve(file); // Fallback to original
              return;
            }
            console.log('[WebP] Converted successfully, size:', blob.size);
            resolve(blob);
          },
          'image/webp',
          0.85
        );
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        console.warn('[WebP] Conversion failed, using original:', error);
        resolve(file); // Fallback to original
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      console.warn('[WebP] Image load failed, using original');
      resolve(file); // Fallback to original
    };

    img.src = objectUrl;
  });
}

/**
 * Upload image with WebP conversion and timeout handling
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  console.log('[Upload] Starting for:', file.name);

  try {
    // Convert to WebP
    const convertedBlob = await convertToWebP(file);
    const isWebP = convertedBlob !== file;
    
    // Generate filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = isWebP ? 'webp' : (file.name.split('.').pop() || 'jpg');
    const fileName = `${userId}/${timestamp}-${randomId}.${ext}`;
    
    console.log('[Upload] Path:', fileName, 'Format:', ext);
    
    // Create upload promise with timeout
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(fileName, convertedBlob, {
        contentType: isWebP ? 'image/webp' : file.type,
        cacheControl: '3600',
        upsert: false
      });

    // Add 30 second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    );

    // Race between upload and timeout
    const result = await Promise.race([
      uploadPromise,
      timeoutPromise
    ]) as { data: any; error: any };

    console.log('[Upload] Response:', result);
    
    if (result.error) {
      console.error('[Upload] Error:', result.error);
      throw new Error(result.error.message || 'Upload failed');
    }
    
    if (!result.data?.path) {
      throw new Error('No path returned from upload');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${result.data.path}`;
    console.log('[Upload] Success:', url);
    
    return { url, path: result.data.path };
  } catch (error) {
    console.error('[Upload] Failed:', error);
    // More specific error messages
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        throw new Error('Upload timed out - please check your connection');
      }
      if (error.message.includes('PolicyError')) {
        throw new Error('Storage permissions error - please contact support');
      }
      throw error;
    }
    throw new Error('Upload failed');
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
    const uploaded = await uploadImage(supabase, files[i], bucket, userId);
    uploadedImages.push(uploaded);
    onProgress?.(i + 1, files.length);
  }
  
  if (uploadedImages.length === 0) {
    throw new Error('No images uploaded');
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
  
  return !error;
}

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

export async function uploadAvatar(
  supabase: SupabaseClient,
  file: File,
  userId: string
): Promise<string> {
  try {
    const convertedBlob = await convertToWebP(file);
    const isWebP = convertedBlob !== file;
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const ext = isWebP ? 'webp' : (file.name.split('.').pop() || 'jpg');
    const fileName = `avatars/${userId}/${timestamp}-${randomId}.${ext}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, convertedBlob, {
        contentType: isWebP ? 'image/webp' : file.type,
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) throw error;
    if (!data?.path) throw new Error('No path returned');
    
    return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  } catch (error) {
    throw error instanceof Error ? error : new Error('Avatar upload failed');
  }
}