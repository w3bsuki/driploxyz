import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Convert image to WebP format with iOS compatibility
 */
async function convertToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('[WebP] Canvas context not available');
      resolve(file); // Fallback to original
      return;
    }
    
    img.onload = () => {
      try {
        // Set max dimensions for performance
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1920;
        
        let width = img.width;
        let height = img.height;
        
        // Scale down if needed
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and convert
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('[WebP] Conversion successful:', {
                originalSize: file.size,
                webpSize: blob.size,
                reduction: Math.round((1 - blob.size / file.size) * 100) + '%'
              });
              resolve(blob);
            } else {
              console.warn('[WebP] Conversion failed, using original');
              resolve(file);
            }
          },
          'image/webp',
          0.85 // Quality
        );
      } catch (err) {
        console.error('[WebP] Conversion error:', err);
        resolve(file); // Fallback to original
      }
    };
    
    img.onerror = () => {
      console.error('[WebP] Image load failed');
      resolve(file); // Fallback to original
    };
    
    // Set timeout for iOS compatibility
    const timeout = setTimeout(() => {
      console.warn('[WebP] Conversion timeout, using original');
      resolve(file);
    }, 5000);
    
    // Start loading
    const reader = new FileReader();
    reader.onload = (e) => {
      clearTimeout(timeout);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      clearTimeout(timeout);
      console.error('[WebP] FileReader error');
      resolve(file);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Upload image to Supabase Storage with WebP conversion
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string
): Promise<UploadedImage> {
  console.log('[Upload] Starting upload:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    bucket,
    userId,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
  });
  
  // Convert to WebP if in browser environment
  let fileToUpload: Blob = file;
  let extension = 'webp';
  
  if (typeof document !== 'undefined' && !file.type.includes('webp')) {
    console.log('[Upload] Converting to WebP...');
    try {
      fileToUpload = await convertToWebP(file);
      // Check if conversion actually happened
      if (fileToUpload === file) {
        console.warn('[Upload] WebP conversion failed, using original format');
        extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      }
    } catch (err) {
      console.error('[Upload] WebP conversion error:', err);
      extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    }
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const fileName = `${userId}/${timestamp}-${randomId}.${extension}`;
  
  console.log('[Upload] Uploading file:', {
    fileName,
    size: fileToUpload.size,
    type: fileToUpload.type || `image/${extension}`
  });
  
  try {
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        cacheControl: '3600',
        upsert: false,
        contentType: `image/${extension}`
      });
    
    console.log('[Upload] Supabase response:', { data, error });
    
    if (error) {
      console.error('[Upload] Supabase error:', error);
      throw error;
    }
    
    if (!data?.path) {
      console.error('[Upload] No path returned from Supabase');
      throw new Error('Upload failed - no path returned');
    }
    
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    
    console.log('[Upload] Success! URL:', url);
    
    return { url, path: data.path };
  } catch (err) {
    console.error('[Upload] Failed:', err);
    throw err;
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