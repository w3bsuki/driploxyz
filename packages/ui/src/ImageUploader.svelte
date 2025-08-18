<script lang="ts">
  interface Props {
    images?: string[];
    maxImages?: number;
    maxSize?: number; // in MB
    acceptedFormats?: string[];
    onImagesChange?: (images: string[]) => void;
    onError?: (error: string) => void;
    disabled?: boolean;
    convertToWebP?: boolean; // Auto-convert to WebP for listings
    webpQuality?: number; // WebP quality (0-1)
    maxDimensions?: { width: number; height: number }; // Max dimensions for resize
    class?: string;
  }

  let { 
    images = [],
    maxImages = 10,
    maxSize = 10, // 10MB default
    acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
    onImagesChange,
    onError,
    disabled = false,
    convertToWebP = true, // Default to true for listings
    webpQuality = 0.85, // High quality WebP
    maxDimensions = { width: 1920, height: 1920 }, // Max dimensions for listings
    class: className = ''
  }: Props = $props();

  let fileInput: HTMLInputElement;
  let dragOver = $state(false);
  let uploading = $state(false);

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      handleFiles(Array.from(target.files));
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    
    if (disabled) return;
    
    const files = event.dataTransfer?.files;
    if (files) {
      handleFiles(Array.from(files));
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled) {
      dragOver = true;
    }
  }

  function handleDragLeave() {
    dragOver = false;
  }

  async function handleFiles(files: File[]) {
    if (images.length + files.length > maxImages) {
      onError?.(`You can only upload up to ${maxImages} images`);
      return;
    }

    uploading = true;
    const newImages: string[] = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!acceptedFormats.includes(file.type)) {
          onError?.(`File ${file.name} is not a supported format`);
          continue;
        }

        // Validate file size
        if (file.size > maxSize * 1024 * 1024) {
          onError?.(`File ${file.name} is too large. Max size is ${maxSize}MB`);
          continue;
        }

        // Convert to base64 or create object URL
        const imageUrl = await processImage(file);
        newImages.push(imageUrl);
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages];
        onImagesChange?.(updatedImages);
      }
    } catch (error) {
      onError?.('Failed to process images');
      console.error('Image upload error:', error);
    } finally {
      uploading = false;
    }
  }

  async function processImage(file: File): Promise<string> {
    if (convertToWebP && file.type !== 'image/webp') {
      try {
        const webpBlob = await convertToWebPFormat(file);
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              reject(new Error('Failed to read WebP file'));
            }
          };
          reader.onerror = () => reject(new Error('Failed to read WebP file'));
          reader.readAsDataURL(webpBlob);
        });
      } catch (error) {
        // Fallback to original if WebP conversion fails
        console.warn('WebP conversion failed, using original:', error);
      }
    }
    
    // Original processing or fallback
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  async function convertToWebPFormat(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }

      img.onload = () => {
        // Calculate dimensions with max constraints
        let { width, height } = img;
        
        if (maxDimensions) {
          const aspectRatio = width / height;
          if (width > maxDimensions.width) {
            width = maxDimensions.width;
            height = width / aspectRatio;
          }
          if (height > maxDimensions.height) {
            height = maxDimensions.height;
            width = height * aspectRatio;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and convert to WebP
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('WebP conversion failed'));
            }
          },
          'image/webp',
          webpQuality
        );
        
        // Clean up
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  function removeImage(index: number) {
    const updatedImages = images.filter((_, i) => i !== index);
    onImagesChange?.(updatedImages);
  }

  function reorderImages(fromIndex: number, toIndex: number) {
    const updatedImages = [...images];
    const [movedItem] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedItem);
    onImagesChange?.(updatedImages);
  }

  function openFileDialog() {
    if (!disabled) {
      fileInput?.click();
    }
  }
</script>

<div class="image-uploader {className}">
  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    multiple
    accept={acceptedFormats.join(',')}
    onchange={handleFileSelect}
    class="hidden"
    {disabled}
  />

  <!-- Image Grid -->
  {#if images.length > 0}
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
      {#each images as image, index}
        <div class="relative group">
          <img
            src={image}
            alt="Upload {index + 1}"
            class="w-full aspect-square object-cover rounded-lg border border-gray-200"
          />
          
          <!-- Image Controls -->
          <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
            transition-opacity rounded-lg flex items-center justify-center space-x-2">
            
            <!-- Move Left -->
            {#if index > 0}
              <button
                onclick={() => reorderImages(index, index - 1)}
                aria-label="Move image left"
                class="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white"
                title="Move left"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            {/if}

            <!-- Delete -->
            <button
              onclick={() => removeImage(index)}
              aria-label="Remove image"
              class="p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full text-white"
              title="Remove image"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <!-- Move Right -->
            {#if index < images.length - 1}
              <button
                onclick={() => reorderImages(index, index + 1)}
                aria-label="Move image right"
                class="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white"
                title="Move right"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            {/if}
          </div>

          <!-- Primary Badge -->
          {#if index === 0}
            <div class="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Primary
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}

  <!-- Upload Area -->
  {#if images.length < maxImages}
    <button
      class="w-full border-2 border-dashed rounded-lg p-6 text-center transition-colors
        {dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
        {disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}"
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
      onclick={openFileDialog}
      onkeydown={(e) => e.key === 'Enter' && openFileDialog()}
      aria-label="Upload images"
      {disabled}
    >
      {#if uploading}
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
          <p class="text-sm text-gray-600">Uploading images...</p>
        </div>
      {:else}
        <div class="flex flex-col items-center">
          <svg class="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          <h3 class="text-lg font-medium text-gray-900 mb-1">
            {images.length === 0 ? 'Add photos' : 'Add more photos'}
          </h3>
          
          <p class="text-sm text-gray-600 mb-4">
            Drag & drop images here, or click to browse
          </p>
          
          <div class="text-xs text-gray-500 space-y-1">
            <p>Up to {maxImages} images, max {maxSize}MB each</p>
            <p>Supported: JPG, PNG, WebP</p>
            {#if convertToWebP}
              <p class="text-green-600 font-medium">✓ Auto-converted to WebP for optimal quality</p>
            {/if}
            {#if images.length === 0}
              <p class="text-blue-600 font-medium">First image will be the main photo</p>
            {/if}
          </div>
        </div>
      {/if}
    </button>
  {/if}

  <!-- Image Count -->
  {#if images.length > 0}
    <div class="flex items-center justify-between mt-3 text-sm text-gray-600">
      <span>{images.length} of {maxImages} images</span>
      {#if images.length > 1}
        <span class="text-xs">Drag images to reorder</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .image-uploader {
    /* Component styles */
  }
</style>