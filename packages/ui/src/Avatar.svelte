<script lang="ts">
  interface Props {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    premium?: boolean;
    onclick?: () => void;
    class?: string;
  }

  let { 
    src,
    alt = '',
    name = '',
    size = 'md',
    premium = false,
    onclick,
    class: className = ''
  }: Props = $props();

  const sizeClasses = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const initial = name ? name.charAt(0).toUpperCase() : '?';
</script>

<button
  {onclick}
  class="relative flex-shrink-0 {onclick ? 'cursor-pointer' : 'cursor-default'} {className}"
  disabled={!onclick}
>
  {#if premium}
    <!-- Premium ring -->
    <div class="rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-[2px] {sizeClasses[size]}">
      <div class="flex items-center justify-center rounded-full bg-white p-[2px] w-full h-full">
        {#if src}
          <img 
            {src} 
            {alt}
            class="rounded-full object-cover w-full h-full"
          />
        {:else}
          <div class="flex items-center justify-center rounded-full bg-gray-200 w-full h-full">
            <span class="font-semibold text-gray-600 {textSizes[size]}">{initial}</span>
          </div>
        {/if}
      </div>
    </div>
  {:else}
    <!-- Regular avatar -->
    {#if src}
      <img 
        {src} 
        {alt}
        class="rounded-full object-cover {sizeClasses[size]}"
      />
    {:else}
      <div class="flex items-center justify-center rounded-full bg-gray-200 {sizeClasses[size]}">
        <span class="font-semibold text-gray-600 {textSizes[size]}">{initial}</span>
      </div>
    {/if}
  {/if}
</button>