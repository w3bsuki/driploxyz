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
    // Translation props
    uploadingImagesText?: string;
    imagesOptimizedText?: string;
    dropHereText?: string;
    addPhotoText?: string;
    coverText?: string;
    removeImageText?: string;
    photosUploadedText?: (count: number) => string;
    moreAllowedText?: (count: number) => string;
    optimizedForWebText?: string;
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
    // Android fix: Use wildcard for better compatibility
    acceptedFormats = 'image/*',
    maxFileSize = 10,
    // Translation props with defaults
    uploadingImagesText = 'Uploading images...',
    imagesOptimizedText = 'Images will be optimized automatically on our servers',
    dropHereText = 'Drop Here',
    addPhotoText = 'Add Photo',
    coverText = 'Cover',
    removeImageText = 'Remove image',
    photosUploadedText = (count: number) => `${count} photo${count === 1 ? '' : 's'} uploaded`,
    moreAllowedText = (count: number) => `${count} more allowed`,
    optimizedForWebText = 'Optimized for web'
  }: Props = $props();

  // State using $state rune
  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let isProcessing = $state(false);
  let conversionProgress = $state({ current: 0, total: 0 });
  let currentError = $state('');
  let failedFiles = $state<File[]>([]);
  let retryAttempts = $state(0);

  // Derived states using $derived
  const remainingSlots = $derived(maxImages - images.length);
  const canUploadMore = $derived(remainingSlots > 0 && !uploading && !isProcessing);
  const hasError = $derived(error || currentError);

  // Enhanced file validation with user-friendly messages
  function validateFiles(files: File[]): string | null {
    for (const file of files) {
      // Check file type with specific guidance
      if (!file.type.startsWith('image/')) {
        const fileExt = file.name.split('.').pop()?.toLowerCase();
        if (fileExt && ['pdf', 'doc', 'docx', 'txt'].includes(fileExt)) {
          return `"${file.name}" is a document file. Please upload photos of your item instead.`;
        } else if (fileExt && ['mp4', 'mov', 'avi', 'mkv'].includes(fileExt)) {
          return `"${file.name}" is a video file. Please upload photos instead, or take screenshots from your video.`;
        } else {
          return `"${file.name}" is not a supported image format. Please use JPG, PNG, or WEBP images.`;
        }
      }
      
      // Check file size with helpful suggestions
      if (file.size > maxFileSize * 1024 * 1024) {
        const fileSizeMB = Math.round(file.size / (1024 * 1024) * 10) / 10;
        if (fileSizeMB > 50) {
          return `"${file.name}" is ${fileSizeMB}MB, which is very large. Try taking a new photo with your phone camera instead of using saved images.`;
        } else {
          return `"${file.name}" is ${fileSizeMB}MB (max ${maxFileSize}MB). Try compressing the image or taking a new photo.`;
        }
      }
      
      // Check for corrupted or empty files
      if (file.size === 0) {
        return `"${file.name}" appears to be empty or corrupted. Please try selecting the file again.`;
      }
    }
    
    // Check if total would exceed limit with context
    if (files.length > remainingSlots) {
      const trying = files.length;
      const allowed = remainingSlots;
      if (allowed === 0) {
        return `You've reached the maximum of ${maxImages} photos. Remove some photos to add new ones.`;
      } else {
        return `You selected ${trying} photos, but can only add ${allowed} more. You can upload up to ${maxImages} photos total.`;
      }
    }
    
    return null;
  }

  // File selection handler - Enhanced for Android compatibility
  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log('[ImageUploader] File input changed, files:', input.files?.length);
    
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      console.log('[ImageUploader] Processing files:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
      
      await processFiles(files);
      
      // Clear input to allow re-selecting same files (Android fix)
      try {
        input.value = '';
        input.type = '';
        input.type = 'file';
      } catch (error) {
        // Fallback if above doesn't work on some Android browsers
        console.warn('[ImageUploader] Could not reset input:', error);
      }
    } else {
      console.warn('[ImageUploader] No files selected or input.files is null');
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
      
      // Check if all files were uploaded successfully
      if (uploadedImages.length === 0) {
        throw new Error('No images were uploaded successfully. Please check your internet connection and try again.');
      } else if (uploadedImages.length < imageFiles.length) {
        currentError = `Only ${uploadedImages.length} of ${imageFiles.length} images uploaded successfully. Some may have been too large or corrupted.`;
      }
      
      // Add successfully uploaded images
      images = [...images, ...uploadedImages];
      console.log('[ImageUploader] Images added to collection:', images.length);
      
    } catch (error) {
      console.error('[ImageUploader] Upload error:', error);
      failedFiles = imageFiles; // Store failed files for retry
      retryAttempts++;
      
      // Provide specific user-friendly error messages
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          currentError = retryAttempts < 3 
            ? 'Upload failed due to network issues. Click "Try Again" or check your internet connection.' 
            : 'Upload failed multiple times due to network issues. Please check your internet connection and try again later.';
        } else if (errorMsg.includes('token') || errorMsg.includes('auth')) {
          currentError = 'Upload failed due to authentication issues. Please refresh the page and try again.';
        } else if (errorMsg.includes('size') || errorMsg.includes('large')) {
          currentError = 'One or more images are too large to upload. Try using smaller images or taking new photos.';
        } else if (errorMsg.includes('format') || errorMsg.includes('type')) {
          currentError = 'One or more files are in an unsupported format. Please use JPG, PNG, or WEBP images only.';
        } else if (errorMsg.includes('quota') || errorMsg.includes('limit')) {
          currentError = 'Upload failed due to storage limits. Please contact support if this continues.';
        } else if (errorMsg.includes('timeout')) {
          currentError = 'Upload timed out. This usually happens with very large images or slow connections. Try again with smaller images.';
        } else {
          currentError = retryAttempts < 3 
            ? `Upload failed: ${error.message}. Click "Try Again" or contact support if the problem persists.` 
            : `Upload failed multiple times: ${error.message}. Please contact support.`;
        }
      } else {
        currentError = retryAttempts < 3 
          ? 'Upload failed due to an unknown error. Click "Try Again" below or contact support if the problem continues.' 
          : 'Upload failed multiple times due to unknown errors. Please contact support.';
      }
    } finally {
      isProcessing = false;
      conversionProgress = { current: 0, total: 0 };
    }
  }

  // Retry failed upload
  async function retryUpload() {
    if (failedFiles.length > 0) {
      currentError = '';
      await processFiles(failedFiles);
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

  // Trigger file input - Enhanced for mobile/Android with detailed error handling
  function triggerFileInput() {
    if (!canUploadMore) {
      if (remainingSlots === 0) {
        currentError = `You've reached the maximum of ${maxImages} photos. Remove some photos to add more.`;
      } else if (uploading) {
        currentError = 'Please wait for current upload to finish before adding more photos.';
      }
      return;
    }
    
    currentError = '';
    console.log('[ImageUploader] Triggering file input');
    
    // Detect user agent for specific Android handling
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    
    try {
      if (isAndroid || isMobile) {
        // Android-specific handling with longer delay
        console.log('[ImageUploader] Detected mobile/Android, using enhanced handling');
        setTimeout(() => {
          try {
            // Try multiple methods for Android compatibility
            fileInput.focus();
            fileInput.click();
            
            // Fallback: trigger the input change event manually
            setTimeout(() => {
              if (!fileInput.files || fileInput.files.length === 0) {
                console.warn('[ImageUploader] File picker may not have opened properly on Android');
              }
            }, 1000);
            
          } catch (innerError) {
            console.error('[ImageUploader] Android click failed:', innerError);
            currentError = 'Camera/gallery access failed. Please check app permissions and try again.';
          }
        }, 150);
      } else {
        // Desktop handling
        fileInput.focus();
        fileInput.click();
      }
    } catch (error) {
      console.error('[ImageUploader] Error triggering file input:', error);
      
      if (isAndroid) {
        currentError = 'Unable to access camera/gallery. Please check that Driplo has permission to access your photos, then try again.';
      } else if (isMobile) {
        currentError = 'Unable to open file picker. Please try using a different browser or check your browser permissions.';
      } else {
        currentError = 'Unable to open file picker. Please try again or use a different browser.';
      }
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
          {uploadingImagesText}
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
        {imagesOptimizedText}
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
            {coverText}
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
          aria-label={removeImageText}
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
            <span class="text-xs text-blue-600 font-medium text-center px-1">{dropHereText}</span>
          {:else}
            <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="text-xs text-gray-500 text-center px-1">{addPhotoText}</span>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- File input - Fixed for Android compatibility -->
  <input
    bind:this={fileInput}
    {id}
    type="file"
    accept={acceptedFormats}
    multiple
    class="sr-only"
    style="position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0;"
    onchange={handleFileSelect}
    disabled={!canUploadMore}
  />

  <!-- Info and error messages -->
  <div class="space-y-2">
    {#if hasError}
      <div class="p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-red-800">Upload Issue</h3>
            <div class="mt-1 text-sm text-red-700">
              <p>{hasError}</p>
            </div>
            <!-- Action buttons for errors -->
            <div class="mt-3 flex gap-2">
              <!-- Retry button for retryable errors -->
              {#if failedFiles.length > 0 && retryAttempts < 3 && (hasError.includes('network') || hasError.includes('timeout') || hasError.includes('Try Again'))}
                <button
                  type="button"
                  class="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                  onclick={retryUpload}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Retrying...' : 'Try Again'}
                </button>
              {/if}
              
              <!-- Help button for complex errors -->
              {#if hasError.includes('permission') || hasError.includes('Android') || hasError.includes('browser')}
                <button
                  type="button"
                  class="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full hover:bg-red-200 transition-colors"
                  onclick={() => {
                    // Show help modal or instructions
                    if (hasError.includes('permission')) {
                      alert('To fix permissions on Android:\n1. Open your browser settings\n2. Find "Site permissions" or "Privacy"\n3. Allow camera/storage access for driplo.xyz\n4. Refresh the page and try again');
                    } else if (hasError.includes('browser')) {
                      alert('Try these steps:\n1. Update your browser to the latest version\n2. Try using Chrome or Firefox\n3. Clear your browser cache\n4. Try in incognito/private mode');
                    }
                  }}
                >
                  Need help?
                </button>
              {/if}
            </div>
          </div>
          <!-- Dismiss button -->
          <div class="ml-auto pl-3">
            <button
              type="button"
              onclick={() => currentError = ''}
              class="inline-flex rounded-md bg-red-50 p-1.5 text-red-400 hover:bg-red-100 focus:outline-none"
            >
              <svg class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
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
          {photosUploadedText(images.length)}
          {#if remainingSlots > 0}
            • {moreAllowedText(remainingSlots)}
          {/if}
        </span>
        <span class="flex items-center">
          <span class="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
          {optimizedForWebText}
        </span>
      </div>
    {/if}
  </div>

</div>