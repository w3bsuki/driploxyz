<script lang="ts">
  import Input from './Input.svelte';
  import Button from './Button.svelte';

  interface SocialLink {
    type: string;
    url: string;
  }

  interface Props {
    links?: SocialLink[];
    onUpdate?: (links: SocialLink[]) => void;
    class?: string;
  }

  let { 
    links = [],
    onUpdate,
    class: className = ''
  }: Props = $props();

  const socialPlatforms = [
    { value: 'instagram', label: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-600', placeholder: '@username' },
    { value: 'tiktok', label: 'TikTok', icon: '🎵', color: 'from-black to-red-600', placeholder: '@username' },
    { value: 'twitter', label: 'Twitter', icon: '🐦', color: 'from-blue-400 to-blue-600', placeholder: '@username' },
    { value: 'facebook', label: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-800', placeholder: 'Facebook URL' },
    { value: 'youtube', label: 'YouTube', icon: '🎥', color: 'from-red-500 to-red-700', placeholder: 'Channel URL' },
    { value: 'website', label: 'Website', icon: '🌐', color: 'from-gray-500 to-gray-700', placeholder: 'https://yoursite.com' }
  ];

  function addLink() {
    const newLinks = [...links, { type: 'instagram', url: '' }];
    links = newLinks;
    onUpdate?.(newLinks);
  }

  function removeLink(index: number) {
    const newLinks = links.filter((_, i) => i !== index);
    links = newLinks;
    onUpdate?.(newLinks);
  }

  function updateLink(index: number, field: keyof SocialLink, value: string) {
    const newLinks = [...links];
    newLinks[index] = { ...newLinks[index], [field]: value };
    links = newLinks;
    onUpdate?.(newLinks);
  }

  function getPlatformInfo(type: string) {
    return socialPlatforms.find(p => p.value === type) || socialPlatforms[0];
  }
</script>

<div class="space-y-6 {className}">
  <div class="text-center">
    <h3 class="text-lg font-semibold text-gray-900 mb-2">Connect Your Socials</h3>
    <p class="text-sm text-gray-600">Let buyers discover more about your style and brand</p>
  </div>

  <!-- Social Links List -->
  <div class="space-y-4">
    {#each links as link, index}
      {@const platformInfo = getPlatformInfo(link.type)}
      <div class="group bg-white/70 backdrop-blur-xs rounded-2xl border border-gray-200/50 p-4 hover:bg-white/90 transition-all duration-300">
        <div class="flex items-start space-x-4">
          <!-- Platform Icon -->
          <div class="shrink-0">
            <div class="w-12 h-12 rounded-xl bg-linear-to-br {platformInfo.color} flex items-center justify-center text-white text-lg">
              {platformInfo.icon}
            </div>
          </div>

          <!-- Input Fields -->
          <div class="flex-1 space-y-3">
            <div>
              <label for={`platform-${index}`} class="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select 
                id={`platform-${index}`}
                bind:value={link.type}
                onchange={(e) => updateLink(index, 'type', e.target.value)}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80"
              >
                {#each socialPlatforms as platform}
                  <option value={platform.value}>{platform.label}</option>
                {/each}
              </select>
            </div>
            
            <div>
              <label for={`url-${index}`} class="block text-sm font-medium text-gray-700 mb-1">URL/Username</label>
              <Input
                id={`url-${index}`}
                bind:value={link.url}
                placeholder={platformInfo.placeholder}
                onchange={(value) => updateLink(index, 'url', value)}
                class="bg-white/80"
              />
            </div>
          </div>

          <!-- Remove Button -->
          <button
            onclick={() => removeLink(index)}
            class="shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Remove social link"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    {/each}

    <!-- Empty State -->
    {#if links.length === 0}
      <div class="text-center py-8">
        <div class="w-16 h-16 mx-auto bg-linear-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mb-4">
          <span class="text-2xl">📱</span>
        </div>
        <p class="text-gray-500 text-sm mb-4">No social links added yet</p>
        <p class="text-xs text-gray-400">Connect your social accounts to build trust with buyers</p>
      </div>
    {/if}

    <!-- Add Link Button -->
    <Button
      onclick={addLink}
      variant="outline"
      class="w-full py-3 border-dashed border-2 hover:bg-indigo-50 hover:border-indigo-300 group"
    >
      <div class="flex items-center justify-center space-x-2">
        <svg class="w-5 h-5 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        <span class="font-medium group-hover:text-indigo-600">Add Social Link</span>
      </div>
    </Button>
  </div>

  <!-- Popular Platforms Quick Add -->
  {#if links.length === 0}
    <div class="space-y-3">
      <p class="text-xs text-gray-500 text-center">Quick add popular platforms:</p>
      <div class="flex flex-wrap justify-center gap-2">
        {#each socialPlatforms.slice(0, 3) as platform}
          <button
            onclick={() => {
              const newLinks = [...links, { type: platform.value, url: '' }];
              links = newLinks;
              onUpdate?.(newLinks);
            }}
            class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/70 hover:bg-white/90 border border-gray-200 rounded-lg transition-colors duration-200 text-sm"
          >
            <span>{platform.icon}</span>
            <span class="font-medium text-gray-700">{platform.label}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}
</div>