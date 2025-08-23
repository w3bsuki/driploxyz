import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface UploadedImage {
  url: string;
  path: string;
}

async function optimizeImageToWebP(file: File, quality: number = 0.6): Promise<File> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Image optimization timeout after 10 seconds'));
    }, 10000); // Reduced timeout

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // More aggressive size reduction to save egress
        const maxWidth = 800;  // Reduced from 1200
        const maxHeight = 800; // Reduced from 1200
        
        let { width, height } = img;
        
        // Always resize if larger than max dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          clearTimeout(timeoutId);
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Improve image quality during resize
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          clearTimeout(timeoutId);
          if (!blob) {
            reject(new Error('Failed to convert image to WebP'));
            return;
          }
          
          console.log(`📦 Optimized: ${file.name} ${(file.size / 1024).toFixed(1)}KB → ${(blob.size / 1024).toFixed(1)}KB`);
          
          const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          
          resolve(webpFile);
        }, 'image/webp', quality);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    };
    
    img.onerror = () => {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load image'));
    };
    
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  bucket: string = 'product-images',
  userId: string,
  retries: number = 2
): Promise<UploadedImage> {
  console.log('Starting image upload process...', file.name);
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`🔄 Retry attempt ${attempt}/${retries} for ${file.name}`);
        // Add exponential backoff delay
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
      
      // Always optimize to WebP
      console.log('Optimizing image to WebP...');
      const optimizedFile = await optimizeImageToWebP(file);
      console.log(`Image optimized: ${file.name} → ${(optimizedFile.size / 1024).toFixed(1)}KB`);
      
      // Generate unique filename with .webp extension
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 9);
      const fileName = `${userId}/${timestamp}-${randomId}.webp`;
      
      console.log('Uploading to Supabase...', fileName);
      
      // Add timeout to Supabase upload
      const uploadPromise = supabase.storage
        .from(bucket)
        .upload(fileName, optimizedFile, {
          contentType: 'image/webp',
          cacheControl: '3600',
          upsert: false
        });
      
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase upload timeout after 15 seconds')), 15000)
      );
      
      const { data, error } = await Promise.race([uploadPromise, timeoutPromise]);
      
      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }
      
      const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`;
      console.log('✅ Upload successful:', url);
      
      return {
        url,
        path: data.path
      };
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`❌ Upload attempt ${attempt + 1} failed:`, lastError.message);
      
      // Don't retry certain errors
      if (lastError.message.includes('Image optimization') || 
          lastError.message.includes('canvas context') ||
          lastError.message.includes('Failed to load image')) {
        throw lastError;
      }
    }
  }
  
  // All retries exhausted
  const finalError = lastError || new Error('Upload failed after all retries');
  console.error('🚫 All upload attempts failed:', finalError.message);
  throw finalError;
}

export async function uploadImages(
  supabase: SupabaseClient,
  files: File[],
  bucket: string = 'product-images',
  userId: string,
  onProgress?: (current: number, total: number) => void
): Promise<UploadedImage[]> {
  const uploadedImages: UploadedImage[] = [];
  
  console.log(`Starting batch upload of ${files.length} images...`);
  
  for (let i = 0; i < files.length; i++) {
    try {
      console.log(`Processing image ${i + 1}/${files.length}: ${files[i].name}`);
      const uploaded = await uploadImage(supabase, files[i], bucket, userId);
      uploadedImages.push(uploaded);
      console.log(`Successfully uploaded image ${i + 1}/${files.length}`);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`Failed to upload image ${i + 1}:`, error);
      // Continue with other images instead of stopping completely
    }
  }
  
  if (uploadedImages.length === 0) {
    throw new Error('Failed to upload any images');
  }
  
  console.log(`Batch upload completed: ${uploadedImages.length}/${files.length} images uploaded successfully`);
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
  const timestamp = Date.now();
  const fileName = `avatars/${userId}/${timestamp}.${file.name.split('.').pop()?.toLowerCase() || 'jpg'}`;
  
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: true
    });
  
  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }
  
  const url = `${PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
  
  return url;
}