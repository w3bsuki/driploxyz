<script lang="ts">
  interface Props {
    currentAvatar?: string;
    onUpload?: (avatarUrl: string) => void;
    onError?: (error: string) => void;
    uploadFunction: (file: File) => Promise<string>;
    disabled?: boolean;
    // Translation props
    uploadingText?: string;
    uploadText?: string;
    changePhotoText?: string;
    dropHereText?: string;
    errorText?: string;
    selectFileText?: string;
  }

  let { 
    currentAvatar = '',
    onUpload,
    onError,
    uploadFunction,
    disabled = false,
    // Translation defaults
    uploadingText = 'Uploading...',
    uploadText = 'Upload Photo',
    changePhotoText = 'Change Photo',
    dropHereText = 'Drop Here',
    errorText = 'Upload failed',
    selectFileText = 'Select a photo'
  }: Props = $props();


  let fileInput: HTMLInputElement = $state()!;
  let uploading = $state(false);
  let isDragging = $state(false);
  let error = $state('');

  // File validation
  function validateFile(file: File): string | null {
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, or WEBP)';
    }
    
    // 10MB limit
    if (file.size > 10 * 1024 * 1024) {
      const sizeMB = Math.round(file.size / (1024 * 1024) * 10) / 10;
      return `Image is ${sizeMB}MB. Please use an image smaller than 10MB.`;
    }
    
    return null;
  }

  // Process file upload
  async function processUpload(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      error = validationError;
      onError?.(validationError);
      return;
    }

    uploading = true;
    error = '';

    try {
      const avatarUrl = await uploadFunction(file);
      onUpload?.(avatarUrl);
    } catch (uploadError: any) {
      const errorMsg = uploadError?.message || 'Failed to upload avatar';
      error = errorMsg;
      onError?.(errorMsg);
    } finally {
      uploading = false;
    }
  }

  // File input handler
  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      await processUpload(input.files[0]);
      // Reset input
      input.value = '';
    }
  }

  // Drag and drop handlers
  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!disabled && !uploading) {
      isDragging = true;
    }
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    if (!(event.currentTarget as HTMLElement)?.contains?.(event.relatedTarget as Node)) {
      isDragging = false;
    }
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    
    if (disabled || uploading || !event.dataTransfer?.files?.[0]) {
      return;
    }
    
    await processUpload(event.dataTransfer.files[0]);
  }

  // Trigger file input
  function triggerFileInput() {
    if (!disabled && !uploading) {
      error = '';
      fileInput?.click();
    }
  }

  // Handle keyboard interaction
  function handleKeyDown(event: KeyboardEvent) {
    if ((event.key === 'Enter' || event.key === ' ') && !disabled && !uploading) {
      event.preventDefault();
      triggerFileInput();
    }
  }
</script>

<div class="space-y-4">
  <!-- Upload Area -->
  <div
    class="relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors duration-200 {isDragging 
      ? 'border-blue-500 bg-[var(--surface-brand-strong)]/5' 
      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'} {disabled || uploading 
      ? 'opacity-50 cursor-not-allowed' 
      : ''}"
    onclick={triggerFileInput}
    ondrop={handleDrop}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="0"
    aria-label={currentAvatar ? changePhotoText : uploadText}
    aria-disabled={disabled || uploading}
  >
    {#if uploading}
      <div class="flex flex-col items-center space-y-2">
        <div class="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin"></div>
        <span class="text-sm text-[var(--brand-primary-strong)] font-medium">{uploadingText}</span>
      </div>
    {:else if isDragging}
      <div class="flex flex-col items-center space-y-2">
        <svg class="h-8 w-8 text-[var(--brand-primary-strong)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span class="text-sm text-[var(--brand-primary-strong)] font-medium">{dropHereText}</span>
      </div>
    {:else}
      <div class="flex flex-col items-center space-y-2">
        <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <div class="space-y-1">
          <span class="text-sm font-medium text-gray-900">
            {currentAvatar ? changePhotoText : uploadText}
          </span>
          <p class="text-xs text-gray-500">{selectFileText}</p>
        </div>
      </div>
    {/if}
  </div>

  <!-- Hidden file input -->
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    class="sr-only"
    onchange={handleFileSelect}
    disabled={disabled || uploading}
  />

  <!-- Error display -->
  {#if error}
    <div class="p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <svg class="h-4 w-4 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="ml-2">
          <p class="text-sm text-red-700">{error}</p>
        </div>
        <button
          type="button"
          onclick={() => error = ''}
          class="ml-auto pl-2 text-red-400 hover:text-red-500"
          aria-label="Dismiss error"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  {/if}

  <!-- Help text -->
  <div class="flex items-start space-x-2">
    <svg class="h-4 w-4 text-[var(--brand-primary-strong)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <p class="text-xs text-gray-500">
      Upload JPG, PNG, or WEBP images. Photos will be automatically optimized and converted to WebP format.
    </p>
  </div>
</div>