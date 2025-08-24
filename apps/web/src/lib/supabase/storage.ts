import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Resize and compress image - try WebP first, fallback to JPEG
 */
async function optimizeImage(file: File): Promise<{ blob: Blob; extension: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      // If canvas not supported, just use original file
      resolve({ blob: file, extension: file.name.split('.').pop() || 'jpg' });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    let resolved = false;

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        URL.revokeObjectURL(objectUrl);
        console.warn('Image optimization timed out, using original');
        resolve({ blob: file, extension: file.name.split('.').pop() || 'jpg' });
      }
    }, 5000);

    img.onload = () => {
      if (resolved) return;
      
      try {
        // Max dimensions - smaller to prevent memory issues
        const MAX_SIZE = 1000;
        let { width, height } = img;
        
        // Only resize if larger than max
        if (width > MAX_SIZE || height > MAX_SIZE) {
          const scale = MAX_SIZE / Math.max(width, height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw image
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try WebP first with a short timeout
        let webpAttempted = false;
        const webpTimeout = setTimeout(() => {
          if (!webpAttempted && !resolved) {
            console.log('WebP taking too long, trying JPEG');
            // Try JPEG fallback
            canvas.toBlob(
              (blob) => {
                if (!resolved && blob) {
                  resolved = true;
                  clearTimeout(timeout);
                  URL.revokeObjectURL(objectUrl);
                  resolve({ blob, extension: 'jpg' });
                }
              },
              'image/jpeg',
              0.85
            );
          }
        }, 2000);

        // Try WebP
        webpAttempted = true;
        canvas.toBlob(
          (blob) => {
            clearTimeout(webpTimeout);
            if (!resolved && blob) {
              resolved = true;
              clearTimeout(timeout);
              URL.revokeObjectURL(objectUrl);
              console.log('WebP conversion successful');
              resolve({ blob, extension: 'webp' });
            } else if (!resolved) {
              // WebP failed, try JPEG
              canvas.toBlob(
                (jpegBlob) => {
                  if (!resolved && jpegBlob) {
                    resolved = true;
                    clearTimeout(timeout);
                    URL.revokeObjectURL(objectUrl);
                    console.log('Using JPEG fallback');
                    resolve({ blob: jpegBlob, extension: 'jpg' });
                  }
                },
                'image/jpeg',
                0.85
              );
            }
          },
          'image/webp',
          0.85
        );
      } catch (err) {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          console.error('Canvas error, using original:', err);
          resolve({ blob: file, extension: file.name.split('.').pop() || 'jpg' });
        }
      }
    };

    img.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);
        console.error('Image load failed, using original');
        resolve({ blob: file, extension: file.name.split('.').pop() || 'jpg' });
      }
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

    console.log('Starting image optimization...');
    
    // Optimize image with timeout and fallback
    const { blob, extension } = await optimizeImage(file);
    
    console.log(`Optimization done: ${extension}, size: ${blob.size}`);
    
    // Generate filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `${userId}/${timestamp}-${randomId}.${extension}`;
    
    console.log('Uploading to Supabase...');
    
    // Upload to Supabase with timeout
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(fileName, blob, {
        contentType: extension === 'webp' ? 'image/webp' : 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    // 30 second timeout for upload
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000)
    );

    const { data, error } = await Promise.race([uploadPromise, timeoutPromise as any]);
    
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
    
    // Optimize avatar
    const { blob, extension } = await optimizeImage(file);
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const fileName = `avatars/${userId}/${timestamp}-${randomId}.${extension}`;
    
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, blob, {
        contentType: extension === 'webp' ? 'image/webp' : 'image/jpeg',
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