<script lang="ts">
  /**
   * Base Favorite Button Primitive
   * Pure UI component without app-specific logic
   * Handles visual states: idle, loading, favorited
   */
  
  interface Props {
    favorited?: boolean;
    count?: number;
    showCount?: boolean;
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    absolute?: boolean;
    customPosition?: string;
    label?: string;
    onclick?: () => void;
  }

  let {
    favorited = false,
    count = 0,
    showCount = true,
    disabled = false,
    loading = false,
    size = 'md',
    absolute = true,
    customPosition = 'top-2 right-2',
    label = favorited ? 'Remove from favorites' : 'Add to favorites',
    onclick
  }: Props = $props();

  // Phase 3: Touch target minimum 44px on mobile
  const sizeClasses = {
    sm: 'h-11 w-11 sm:h-8 sm:w-8 text-sm',
    md: 'h-11 w-11 sm:h-10 sm:w-10 text-base',
    lg: 'h-12 w-12 text-lg'
  };

  const buttonClass = $derived(`
    ${absolute ? 'absolute' : 'relative'}
    ${absolute ? customPosition : ''}
    ${sizeClasses[size]}
    flex items-center justify-center
    rounded-full
    transition-all duration-200
    ${favorited ? 'bg-red-50 text-red-600' : 'bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-600'}
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
    backdrop-blur-sm
    shadow-sm hover:shadow-md
    z-10
  `.trim().replace(/\s+/g, ' '));
</script>

<button
  type="button"
  class={buttonClass}
  disabled={disabled || loading}
  onclick={onclick}
  aria-label={label}
>
  {#if loading}
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {:else}
    <svg
      class="h-5 w-5 transition-transform"
      fill={favorited ? 'currentColor' : 'none'}
      stroke="currentColor"
      stroke-width="2"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  {/if}
  
  {#if showCount && count > 0}
    <span class="ml-1 text-xs font-medium">
      {count}
    </span>
  {/if}
</button>

<style>
  button {
    -webkit-tap-highlight-color: transparent;
  }
</style>
