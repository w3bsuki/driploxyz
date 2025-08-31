<script lang="ts">
  import Avatar from './Avatar.svelte';

  interface Props {
    selected?: string;
    onSelect?: (avatarUrl: string) => void;
    uploadEnabled?: boolean;
    onUpload?: (file: File) => void;
    class?: string;
  }

  let { 
    selected = $bindable(''),
    onSelect,
    uploadEnabled = true,
    onUpload,
    class: className = ''
  }: Props = $props();

  const defaultAvatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=1&backgroundColor=f3f4f6',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=2&backgroundColor=ddd6fe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=3&backgroundColor=fef3c7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=4&backgroundColor=fce7f3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=5&backgroundColor=dcfce7',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=6&backgroundColor=cffafe',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=7&backgroundColor=fef2f2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=8&backgroundColor=f0f9ff',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=9&backgroundColor=fafaf9',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=10&backgroundColor=f5f3ff',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=11&backgroundColor=fff7ed',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=12&backgroundColor=ecfdf5'
  ];

  let fileInput = $state<HTMLInputElement>();
  let currentBlobUrl = $state<string | null>(null);

  function handleAvatarSelect(avatarUrl: string) {
    // Clean up any existing blob URL when selecting a different avatar
    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
      currentBlobUrl = null;
    }
    selected = avatarUrl;
    onSelect?.(avatarUrl);
  }

  function handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      // Clean up any existing blob URL
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
      
      // Create a URL for the file to preview it
      const fileUrl = URL.createObjectURL(file);
      currentBlobUrl = fileUrl;
      
      // Only set selected to blob URL for preview - onUpload should handle the actual upload
      // and call onSelect with the final URL when upload is complete
      selected = fileUrl;
      onUpload?.(file);
    }
  }

  // Cleanup when component is destroyed
  $effect(() => {
    return () => {
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  });

  function triggerUpload() {
    fileInput?.click();
  }
</script>

<div class="space-y-6 {className}">
  <div class="text-center mb-6">
    <h3 class="text-2xl font-bold text-gray-900 mb-2">Choose Your Avatar</h3>
    <p class="text-gray-500">Pick an avatar or upload your own photo</p>
  </div>

  <!-- Selected Avatar Preview -->
  {#if selected}
    <div class="flex justify-center mb-6">
      <div class="relative">
        <Avatar src={selected} name="Your Avatar" size="xl" class="ring-2 ring-black/20" />
        <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-black rounded-full border-2 border-white flex items-center justify-center">
          <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
      </div>
    </div>
  {/if}

  <!-- Avatar Grid -->
  <div class="grid grid-cols-4 sm:grid-cols-6 gap-4">
    {#each defaultAvatars as avatar}
      <button
        type="button"
        onclick={() => handleAvatarSelect(avatar)}
        class="relative group"
      >
        <div class="relative overflow-hidden rounded-xl border-2 transition-colors {selected === avatar ? 'border-black' : 'border-gray-200 hover:border-gray-300'}">
          <img src={avatar} alt="Avatar option" class="w-full h-full object-cover" />
          
          <!-- Selection indicator -->
          {#if selected === avatar}
            <div class="absolute top-1 right-1 w-4 h-4 bg-black rounded-full flex items-center justify-center">
              <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          {/if}
        </div>
      </button>
    {/each}
    
    <!-- Upload Button -->
    {#if uploadEnabled}
      <button
        type="button"
        onclick={triggerUpload}
        class="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors flex flex-col items-center justify-center space-y-1 group hover:bg-gray-50"
      >
        <svg class="w-6 h-6 text-gray-400 group-hover:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span class="text-xs text-gray-500 group-hover:text-gray-900 font-medium">Upload</span>
      </button>
      
      <input
        bind:this={fileInput}
        type="file"
        accept="image/*"
        onchange={handleFileUpload}
        class="hidden"
      />
    {/if}
  </div>

  <!-- Upload Info -->
  {#if uploadEnabled}
    <div class="text-center">
      <p class="text-sm text-gray-500">
        Upload your own photo (max 5MB, JPG/PNG)
      </p>
    </div>
  {/if}

</div>