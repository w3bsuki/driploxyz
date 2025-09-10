import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';
import { processImage, IMAGE_SIZES } from './image-processor';

export interface UploadedImage {
  url: string;
  path: string;
}

/**
 * Convert image to WebP format (800x800 square)
 */
async function convertToWebP(file: File): Promise<Blob> {
  try {
    const webpBlob = await processImage(file, IMAGE_SIZES.medium);
    return webpBlob;
  } catch (error) {
    console.error('[convertToWebP] Failed, using original:', error);
    return file;
  }
}

/**
 * Upload a single image to Supabase Storage
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string,
  accessToken?: string
): Promise<UploadedImage> {
  console.log('[uploadImage] Starting upload for:', file.name, 'Size:', file.size, 'bytes');
  
  try {
    console.log('[uploadImage] Starting conversion and upload process...');
    
    // Convert to WebP with detailed logging
    let fileToUpload: Blob | File;
    let fileName: string;
    let contentType: string;
    
    try {
      console.log('[uploadImage] Converting to WebP...');
      const webpBlob = await convertToWebP(file);
      fileToUpload = webpBlob;
      contentType = 'image/webp';
      
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      fileName = `${userId}/${timestamp}-${randomId}.webp`;
      
      console.log('[uploadImage] WebP conversion successful, size:', webpBlob.size);
    } catch (conversionError) {
      console.warn('[uploadImage] WebP conversion failed, using original:', conversionError);
      fileToUpload = file;
      contentType = file.type;
      
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const extension = file.name.split('.').pop() || 'jpg';
      fileName = `${userId}/${timestamp}-${randomId}.${extension}`;
    }
    
    console.log('[uploadImage] Uploading to:', fileName, 'Size:', fileToUpload.size, 'Type:', contentType);
    
    // Try direct fetch to storage API if we have access token
    if (accessToken) {
      console.log('[uploadImage] Using direct fetch with access token');
      
      const formData = new FormData();
      formData.append('', fileToUpload, fileName);
      
      const uploadUrl = `${PUBLIC_SUPABASE_URL}/storage/v1/object/${bucket}/${fileName}`;
      
      console.log('[uploadImage] Direct upload to:', uploadUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error('[uploadImage] Direct upload timeout after 30 seconds');
      }, 30000);
      
      try {
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-upsert': 'false'
          },
          body: fileToUpload,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('[uploadImage] Direct upload response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[uploadImage] Direct upload error:', errorText);
          throw new Error(`Upload failed: ${response.status} ${errorText}`);
        }
        
        const responseData = await response.json();
        console.log('[uploadImage] Direct upload response:', responseData);
        
        // Get public URL
        const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`;
        
        console.log('[uploadImage] Upload successful:', url);
        
        return {
          url,
          path: fileName
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Upload timeout - request aborted after 30 seconds');
        }
        throw fetchError;
      }
    }
    
    // Fallback to using Supabase client (though this seems to hang)
    console.log('[uploadImage] Using Supabase client (no access token)');
    
    const uploadPromise = supabase.storage
      .from(bucket)
      .upload(fileName, fileToUpload, {
        contentType,
        cacheControl: '3600',
        upsert: false
      })
      .then(result => {
        console.log('[uploadImage] Supabase upload result:', result);
        return result;
      })
      .catch(err => {
        console.error('[uploadImage] Supabase upload error:', err);
        throw err;
      });
    
    console.log('[uploadImage] Upload promise created:', uploadPromise);
    
    // Create timeout promise (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.error('[uploadImage] Upload timeout after 30 seconds');
        reject(new Error('Upload timeout - storage request hanging'));
      }, 30000);
    });
    
    // Race between upload and timeout
    const { data, error } = await Promise.race([
      uploadPromise,
      timeoutPromise
    ]) as any;
    
    console.log('[uploadImage] Supabase upload response:', { data, error });
    
    if (error) {
      console.error('[uploadImage] Upload error:', error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
    
    if (!data?.path) {
      console.error('[uploadImage] No path in upload response');
      throw new Error('No path returned from upload');
    }
    
    // Get public URL
    const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
    
    console.log('[uploadImage] Upload successful:', url);
    
    return {
      url,
      path: data.path
    };
  } catch (error) {
    console.error('[uploadImage] Upload failed:', error);
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
  onProgress?: (current: number, total: number) => void,
  accessToken?: string
): Promise<UploadedImage[]> {
  const uploadedImages: UploadedImage[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) {
      console.warn(`File at index ${i} is undefined, skipping`);
      continue;
    }
    
    try {
      const uploaded = await uploadImage(supabase, file, bucket, userId, accessToken);
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
    // Convert to WebP for better performance
    const webpBlob = await convertToWebP(file);
    
    // Generate unique filename for avatar
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}.webp`;
    
    // Upload to Supabase
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, webpBlob, {
        contentType: 'image/webp',
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