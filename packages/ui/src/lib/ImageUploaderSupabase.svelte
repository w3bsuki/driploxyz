<script lang="ts">
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
  }

  let { 
    id = 'image-uploader',
    images = $bindable([]),
    maxImages = 10,
    error,
    helpText,
    onUpload,
    onDelete,
    uploading = $bindable(false)
  }: Props = $props();

  let fileInput: HTMLInputElement;
  let isDragging = $state(false);
  let uploadProgress = $state({ current: 0, total: 0 });

  async function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      await processFiles(Array.from(input.files));
    }
  }

  async function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
    
    if (event.dataTransfer?.files) {
      await processFiles(Array.from(event.dataTransfer.files));
    }
  }

  async function processFiles(newFiles: File[]) {
    const remainingSlots = maxImages - images.length;
    const filesToProcess = newFiles
      .filter(file => file.type.startsWith('image/'))
      .slice(0, remainingSlots);
    
    if (filesToProcess.length === 0) {
      return;
    }

    uploading = true;
    uploadProgress = { current: 0, total: filesToProcess.length };

    try {
      const uploadedImages = await onUpload(filesToProcess);
      images = [...images, ...uploadedImages];
    } catch (error) {
      // Handle error silently or pass to parent
    } finally {
      uploading = false;
      uploadProgress = { current: 0, total: 0 };
    }
  }

  async function removeImage(index: number) {
    const image = images[index];
    
    if (onDelete) {
      const deleted = await onDelete(image.path);
      if (deleted) {
        images = images.filter((_, i) => i !== index);
      }
    } else {
      // Just remove from UI if no delete handler
      images = images.filter((_, i) => i !== index);
    }
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
  {#if uploading}
    <div class="mb-4 p-3 bg-blue-50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-blue-700">Uploading images...</span>
        <span class="text-sm text-blue-600">
          {uploadProgress.current}/{uploadProgress.total}
        </span>
      </div>
      <div class="w-full bg-blue-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style="width: {uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%"
        />
      </div>
    </div>
  {/if}

  <!-- Grid layout with images and upload button integrated -->
  <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
    {#each images as image, index}
      <div class="relative aspect-square group">
        <img 
          src={image.url} 
          alt={`Upload ${index + 1}`}
          class="w-full h-full object-cover rounded-lg"
          loading="lazy"
        />
        {#if index === 0}
          <div class="absolute top-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
            Cover
          </div>
        {/if}
        <button
          type="button"
          onclick={() => removeImage(index)}
          disabled={uploading}
          class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          aria-label="Remove image"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/each}

    <!-- Upload button - same size as images -->
    {#if images.length < maxImages && !uploading}
      <div
        role="button"
        tabindex="0"
        class="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors
          {isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}"
        onclick={() => fileInput.click()}
        onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
        ondrop={handleDrop}
        ondragover={handleDragOver}
        ondragleave={handleDragLeave}
      >
        <svg class="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span class="text-xs text-gray-500 mt-1 text-center px-1">Add Photo</span>
      </div>
    {/if}
  </div>

  {#if helpText && !error}
    <p class="mt-2 text-xs text-gray-500">{helpText}</p>
  {/if}

  <input
    bind:this={fileInput}
    {id}
    type="file"
    accept="image/*"
    multiple
    class="hidden"
    onchange={handleFileSelect}
    disabled={uploading}
  />

  {#if helpText && !error}
    <p class="mt-2 text-sm text-gray-500">{helpText}</p>
  {/if}

  {#if error}
    <p class="mt-2 text-sm text-red-600">{error}</p>
  {/if}
</div>