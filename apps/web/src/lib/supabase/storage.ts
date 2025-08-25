import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Check if browser supports WebP
 */
function supportsWebP(): boolean {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  const dataUrl = canvas.toDataURL('image/webp');
  return dataUrl.indexOf('data:image/webp') === 0;
}

/**
 * Convert image to WebP format - MANDATORY for bandwidth
 * Works on all browsers including iOS Safari
 */
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const img = new Image();
    
    // Set crossOrigin to handle any CORS issues
    img.crossOrigin = 'anonymous';
    
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    reader.onload = (e) => {
      img.onerror = () => reject(new Error('Failed to load image'));
      
      img.onload = async () => {
        try {
          // Max 1200px for products - optimized for web
          const MAX_SIZE = 1200;
          let width = img.width;
          let height = img.height;
          
          if (width > height && width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
          
          // Create offscreen canvas for better performance
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d', { 
            willReadFrequently: false,
            alpha: false, // No transparency needed for product images
            desynchronized: true // Better performance
          });
          
          if (!ctx) {
            reject(new Error('Canvas not supported'));
            return;
          }
          
          // White background for better compression
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          
          // Draw image with smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Determine quality based on original file size
          const originalSizeKB = file.size / 1024;
          let quality = 0.85;
          if (originalSizeKB > 2000) quality = 0.75;
          if (originalSizeKB > 4000) quality = 0.70;
          
          console.log(`[WebP] Converting ${file.name} (${originalSizeKB.toFixed(0)}KB) with quality ${quality}`);
          
          // Check WebP support
          const hasWebPSupport = supportsWebP();
          
          if (hasWebPSupport) {
            // Modern browsers with WebP support
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const newSizeKB = blob.size / 1024;
                  const reduction = ((1 - blob.size / file.size) * 100).toFixed(1);
                  console.log(`[WebP] ✅ Converted to WebP: ${newSizeKB.toFixed(0)}KB (${reduction}% reduction) in ${Date.now() - startTime}ms`);
                  resolve(blob);
                } else {
                  // Shouldn't happen but fallback to JPEG
                  canvas.toBlob(
                    (jpegBlob) => {
                      if (jpegBlob) {
                        console.warn('[WebP] ⚠️ WebP failed, using JPEG with .webp extension');
                        resolve(jpegBlob);
                      } else {
                        reject(new Error('Failed to create image blob'));
                      }
                    },
                    'image/jpeg',
                    quality * 0.9
                  );
                }
              },
              'image/webp',
              quality
            );
          } else {
            // Fallback for older browsers/iOS < 14
            // Use JPEG with aggressive compression
            console.warn('[WebP] ⚠️ Browser lacks WebP support, using compressed JPEG');
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const newSizeKB = blob.size / 1024;
                  console.log(`[WebP] 📸 Fallback JPEG: ${newSizeKB.toFixed(0)}KB in ${Date.now() - startTime}ms`);
                  resolve(blob);
                } else {
                  reject(new Error('Failed to compress image'));
                }
              },
              'image/jpeg',
              quality * 0.85 // Slightly lower quality for JPEG to match WebP file sizes
            );
          }
        } catch (error) {
          console.error('[WebP] Conversion error:', error);
          reject(error);
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Supabase Storage - ALWAYS WEBP
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  // ALWAYS convert to WebP - MANDATORY for bandwidth optimization
  let fileToUpload: Blob;
  let contentType = 'image/webp';
  
  if (typeof document !== 'undefined') {
    try {
      fileToUpload = await convertToWebP(file);
      console.log('[Upload] Converted image type:', fileToUpload.type, 'size:', fileToUpload.size);
      
      // FORCE WebP extension regardless of actual blob type
      // This ensures consistency even if browser falls back to JPEG
      contentType = 'image/webp';
    } catch (error) {
      console.error('[Upload] WebP conversion failed:', error);
      throw new Error('Failed to process image. Please try a different image.');
    }
  } else {
    // Server-side fallback (shouldn't happen in normal flow)
    fileToUpload = file;
    contentType = 'image/webp';
  }
  
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  // ALWAYS use .webp extension for consistency
  const fileName = `${userId}/${timestamp}-${randomId}.webp`;
  
  console.log('[Upload] Uploading to Supabase:', fileName, 'contentType:', contentType);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileToUpload, {
      cacheControl: '3600',
      upsert: false,
      contentType: contentType
    });
  
  if (error) {
    console.error('[Upload] Supabase error:', error);
    throw error;
  }
  if (!data?.path) {
    throw new Error('Upload failed - no path returned');
  }
  
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
  console.log('[Upload] Success! URL:', url);
  return { url, path: data.path };
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
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatars/${userId}/${timestamp}-${randomId}.${ext}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw error;
  }
  
  if (!data?.path) {
    throw new Error('Upload failed - no path returned');
  }
  
  return `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
}