<script lang="ts">
  // Svelte 5 implementation with WebP enforcement
  interface UploadedImage {
    url: string;
    path: string;
  }

  interface Props {
    id?: string;
    images?: UploadedImage[];
    maxImages?: number;
    error?: string;
    helpText?: string;
    onUpload: (files: File[]) => Promise<UploadedImage[]>;
    onDelete?: (path: string) => Promise<boolean>;
    uploading?: boolean;
    acceptedFormats?: string;
    maxFileSize?: number; // in MB
  }

  // Svelte 5 props with proper typing
  let { 
    id = 'image-uploader',
    images = $bindable([]),
    maxImages = 10,
    error = '',
    helpText = 'Upload JPG/PNG images (optimized automatically)',
    onUpload,
    onDelete,
    uploading = $bindable(false),
    acceptedFormats = 'image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif',
    maxFileSize = 10
  }: Props = $props();

  // State using $state rune
  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let isProcessing = $state(false);
  let conversionProgress = $state({ current: 0, total: 0 });
  let currentError = $state('');

  // Derived states using $derived
  const remainingSlots = $derived(maxImages - images.length);
  const canUploadMore = $derived(remainingSlots > 0 && !uploading && !isProcessing);
  const hasError = $derived(error || currentError);

  // File validation function
  function validateFiles(files: File[]): string | null {
    for (const file of files) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        return `"${file.name}" is not an image file`;
      }
      
      // Check file size (convert MB to bytes)
      if (file.size > maxFileSize * 1024 * 1024) {
        return `"${file.name}" is too large (max ${maxFileSize}MB)`;
      }
    }
    
    // Check if total would exceed limit
    if (files.length > remainingSlots) {
      return `Too many files. Can only add ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'}`;
    }
    
    return null;
  }

  // File selection handler
  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      await processFiles(Array.from(input.files));
      // Clear input to allow re-selecting same files
      input.value = '';
    }
  }

  // Drag and drop handlers
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (canUploadMore) {
      isDragging = true;
    }
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    // Only stop dragging if we're leaving the main container
    if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
      isDragging = false;
    }
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    
    if (!canUploadMore || !event.dataTransfer?.files) {
      return;
    }
    
    await processFiles(Array.from(event.dataTransfer.files));
  }

  // Main file processing function
  async function processFiles(newFiles: File[]) {
    console.log('[ImageUploader] Processing files:', newFiles.length);
    
    // Clear any previous errors
    currentError = '';
    
    // Validate files
    const validationError = validateFiles(newFiles);
    if (validationError) {
      currentError = validationError;
      return;
    }

    // Filter to only image files
    const imageFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      currentError = 'No valid image files found';
      return;
    }

    console.log('[ImageUploader] Valid image files:', imageFiles.length);
    
    // Set processing state
    isProcessing = true;
    conversionProgress = { current: 0, total: imageFiles.length };

    try {
      console.log('[ImageUploader] Starting upload process...');
      
      // Call the upload function provided by parent
      const uploadedImages = await onUpload(imageFiles);
      
      console.log('[ImageUploader] Upload completed:', uploadedImages.length);
      
      // Add successfully uploaded images
      images = [...images, ...uploadedImages];
      console.log('[ImageUploader] Images added to collection:', images.length);
      
    } catch (error) {
      console.error('[ImageUploader] Upload error:', error);
      currentError = error instanceof Error ? error.message : 'Failed to upload images';
    } finally {
      isProcessing = false;
      conversionProgress = { current: 0, total: 0 };
    }
  }

  // Image removal handler
  async function removeImage(index: number) {
    const image = images[index];
    console.log('[ImageUploader] Removing image:', image.path);
    
    // Optimistic update - remove immediately from UI
    const originalImages = [...images];
    images = images.filter((_, i) => i !== index);
    
    if (onDelete) {
      try {
        const deleted = await onDelete(image.path);
        if (!deleted) {
          // Restore image if deletion failed
          images = originalImages;
          currentError = 'Failed to delete image';
        }
      } catch (error) {
        console.error('[ImageUploader] Delete error:', error);
        // Restore image on error
        images = originalImages;
        currentError = 'Failed to delete image';
      }
    }
  }

  // Trigger file input
  function triggerFileInput() {
    if (canUploadMore) {
      currentError = '';
      fileInput.click();
    }
  }

  // Handle keyboard interaction
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      triggerFileInput();
    }
  }
</script>

<div class="w-full space-y-4">
  <!-- Upload progress -->
  {#if uploading || isProcessing}
    <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-blue-700">
          Uploading images...
        </span>
        {#if conversionProgress.total > 0}
          <span class="text-sm text-blue-600">
            {conversionProgress.current}/{conversionProgress.total}
          </span>
        {/if}
      </div>
      <div class="w-full bg-blue-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style="width: {conversionProgress.total > 0 ? (conversionProgress.current / conversionProgress.total) * 100 : 0}%"
        />
      </div>
      <p class="text-xs text-blue-600 mt-2">
        Images will be optimized automatically on our servers
      </p>
    </div>
  {/if}

  <!-- Image grid with upload area -->
  <div 
    class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
    ondrop={handleDrop}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
  >
    <!-- Uploaded images -->
    {#each images as image, index}
      <div class="relative aspect-square group">
        <img 
          src={image.url} 
          alt={`Upload ${index + 1}`}
          class="w-full h-full object-cover rounded-lg border border-gray-200"
          loading="lazy"
        />
        
        <!-- Cover badge for first image -->
        {#if index === 0}
          <div class="absolute top-1.5 left-1.5 bg-green-600 text-white text-xs px-2 py-0.5 rounded font-medium">
            Cover
          </div>
        {/if}
        
        <!-- Format badge -->
        <div class="absolute top-1.5 right-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
          {#if image.url.toLowerCase().endsWith('.webp')}
            WebP
          {:else if image.url.toLowerCase().includes('.jp')}
            JPG
          {:else}
            IMG
          {/if}
        </div>
        
        <!-- Remove button -->
        <button
          type="button"
          onclick={() => removeImage(index)}
          disabled={uploading || isProcessing}
          class="absolute bottom-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 
                 opacity-0 group-hover:opacity-100 transition-all duration-200 
                 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Remove image"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}

    <!-- Upload area -->
    {#if canUploadMore}
      <div
        role="button"
        tabindex="0"
        class="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center 
               cursor-pointer transition-all duration-200 
               {isDragging 
                 ? 'border-blue-500 bg-blue-50 scale-105' 
                 : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}"
        onclick={triggerFileInput}
        onkeydown={handleKeyDown}
      >
        <div class="flex flex-col items-center space-y-1">
          {#if isDragging}
            <svg class="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span class="text-xs text-blue-600 font-medium text-center px-1">Drop Here</span>
          {:else}
            <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-xs text-gray-500 text-center px-1">Add Photo</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- File input -->
  <input
    bind:this={fileInput}
    {id}
    type="file"
    accept={acceptedFormats}
    multiple
    class="hidden"
    onchange={handleFileSelect}
    disabled={!canUploadMore}
  />

  <!-- Info and error messages -->
  <div class="space-y-2">
    {#if hasError}
      <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-sm text-red-600 flex items-start">
          <svg class="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {hasError}
        </p>
      </div>
    {:else if helpText}
      <div class="flex items-start space-x-2">
        <svg class="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-xs text-gray-500">{helpText}</p>
      </div>
    {/if}

    <!-- Upload stats -->
    {#if images.length > 0}
      <div class="flex items-center justify-between text-xs text-gray-500">
        <span>
          {images.length} photo{images.length === 1 ? '' : 's'} uploaded
          {#if remainingSlots > 0}
            • {remainingSlots} more allowed
          {/if}
        </span>
        <span class="flex items-center">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          Optimized for web
        </span>
      </div>
    {/if}
  </div>

  <!-- Upload instructions -->
  {#if images.length === 0 && !uploading && !isProcessing}
    <div class="text-center py-8">
      <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-sm font-medium text-gray-900 mb-2">Add Your Photos</h3>
      <p class="text-sm text-gray-500 mb-4">
        Upload up to {maxImages} high-quality photos to showcase your item
      </p>
      <button
        type="button"
        onclick={triggerFileInput}
        class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm 
               text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
               disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={!canUploadMore}
      >
        <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Choose Files
      </button>
      <p class="text-xs text-gray-400 mt-2">
        Or drag and drop files here
      </p>
    </div>
  {/if}
</div>