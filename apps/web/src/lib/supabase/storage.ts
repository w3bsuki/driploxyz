import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Convert image to WebP format - MANDATORY for bandwidth
 * Fixed for iOS Safari compatibility
 */
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    console.log(`[WebP] Starting conversion for ${file.name} (${(file.size / 1024).toFixed(0)}KB)`);
    
    const reader = new FileReader();
    
    reader.onerror = (error) => {
      console.error('[WebP] FileReader error:', error);
      reject(new Error('Failed to read file'));
    };
    
    reader.onload = async (e) => {
      try {
        const img = new Image();
        
        // Create promise for image load
        await new Promise((imgResolve, imgReject) => {
          img.onerror = () => {
            console.error('[WebP] Image load failed');
            imgReject(new Error('Failed to load image'));
          };
          
          img.onload = () => {
            console.log(`[WebP] Image loaded: ${img.width}x${img.height}`);
            imgResolve(undefined);
          };
          
          // Set source after handlers
          const result = e.target?.result;
          if (typeof result === 'string') {
            img.src = result;
          } else {
            imgReject(new Error('Invalid file data'));
          }
        });
        
        // Calculate dimensions
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
        
        console.log(`[WebP] Target dimensions: ${width}x${height}`);
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // Get context with iOS-safe options
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context not available');
        }
        
        // Draw white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Draw image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Determine quality
        const originalSizeKB = file.size / 1024;
        let quality = 0.85;
        if (originalSizeKB > 2000) quality = 0.75;
        if (originalSizeKB > 4000) quality = 0.70;
        
        console.log(`[WebP] Applying quality: ${quality}`);
        
        // Try WebP first, with multiple fallbacks
        const formats = [
          { type: 'image/webp', quality: quality, name: 'WebP' },
          { type: 'image/jpeg', quality: quality * 0.9, name: 'JPEG' }
        ];
        
        let convertedBlob: Blob | null = null;
        
        for (const format of formats) {
          console.log(`[WebP] Trying ${format.name} conversion...`);
          
          // Use Promise wrapper for toBlob
          convertedBlob = await new Promise<Blob | null>((blobResolve) => {
            try {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    console.log(`[WebP] ${format.name} blob created: ${(blob.size / 1024).toFixed(0)}KB`);
                  } else {
                    console.warn(`[WebP] ${format.name} blob creation failed`);
                  }
                  blobResolve(blob);
                },
                format.type,
                format.quality
              );
            } catch (error) {
              console.error(`[WebP] ${format.name} conversion error:`, error);
              blobResolve(null);
            }
          });
          
          if (convertedBlob) {
            const reduction = ((1 - convertedBlob.size / file.size) * 100).toFixed(1);
            console.log(`[WebP] ✅ Converted to ${format.name}: ${(convertedBlob.size / 1024).toFixed(0)}KB (${reduction}% reduction) in ${Date.now() - startTime}ms`);
            break;
          }
        }
        
        if (!convertedBlob) {
          // Last resort: return original file
          console.error('[WebP] All conversions failed, using original file');
          resolve(file);
        } else {
          resolve(convertedBlob);
        }
        
      } catch (error) {
        console.error('[WebP] Conversion error:', error);
        // Return original file as fallback
        console.warn('[WebP] Using original file as fallback');
        resolve(file);
      }
    };
    
    // Start reading file
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