<script lang="ts">
  interface Props {
    id?: string;
    images?: string[];
    files?: File[];
    maxImages?: number;
    error?: string;
    helpText?: string;
    onProcessingChange?: (isProcessing: boolean) => void;
  }

  let { 
    id = 'image-uploader',
    images = $bindable([]),
    files = $bindable([]),
    maxImages = 10,
    error,
    helpText,
    onProcessingChange
  }: Props = $props();

  let fileInput: HTMLInputElement;
  let isDragging = $state(false);

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      processFiles(Array.from(input.files));
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    
    if (event.dataTransfer?.files) {
      processFiles(Array.from(event.dataTransfer.files));
    }
  }

  function processFiles(newFiles: File[]) {
    const remainingSlots = maxImages - images.length;
    const filesToProcess = newFiles.slice(0, remainingSlots);

    if (filesToProcess.length > 0) {
      onProcessingChange?.(true);
    }

    let processedCount = 0;
    const totalFiles = filesToProcess.length;

    filesToProcess.forEach(file => {
      if (file.type.startsWith('image/')) {
        // Add the file immediately
        files = [...files, file];
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            images = [...images, e.target.result as string];
          }
          
          processedCount++;
          if (processedCount === totalFiles) {
            onProcessingChange?.(false);
          }
        };
        reader.readAsDataURL(file);
      } else {
        processedCount++;
        if (processedCount === totalFiles) {
          onProcessingChange?.(false);
        }
      }
    });
  }

  function removeImage(index: number) {
    images = images.filter((_, i) => i !== index);
    files = files.filter((_, i) => i !== index);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }
</script>

<div class="w-full">
  {#if images.length > 0}
    <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
      {#each images as image, index}
        <div class="relative aspect-square group">
          <img 
            src={image} 
            alt={`Upload ${index + 1}`}
            class="w-full h-full object-cover rounded-lg"
          />
          {#if index === 0}
            <div class="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Cover
            </div>
          {/if}
          <button
            type="button"
            onclick={() => removeImage(index)}
            class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Remove image"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/each}
    </div>
  {/if}

  {#if images.length < maxImages}
    <div
      role="button"
      tabindex="0"
      class="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}"
      onclick={() => fileInput.click()}
      onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && fileInput.click()}
      ondrop={handleDrop}
      ondragover={handleDragOver}
      ondragleave={handleDragLeave}
    >
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <p class="mt-2 text-sm text-gray-600">
        Click to upload or drag and drop
      </p>
      <p class="text-xs text-gray-500 mt-1">
        {images.length}/{maxImages} images • JPG, PNG up to 5MB
      </p>
    </div>
  {/if}

  <input
    bind:this={fileInput}
    {id}
    type="file"
    accept="image/*"
    multiple
    class="hidden"
    onchange={handleFileSelect}
  />

  {#if helpText && !error}
    <p class="mt-2 text-sm text-gray-500">{helpText}</p>
  {/if}

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
</div>