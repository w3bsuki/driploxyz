<script lang="ts">
  /**
   * Base Follow Button Primitive
   * Pure UI component without app-specific logic
   * Handles visual states: following, not following, loading
   */
  
  interface Props {
    following?: boolean;
    disabled?: boolean;
    loading?: boolean;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline' | 'ghost';
    followText?: string;
    followingText?: string;
    onclick?: () => void;
  }

  let {
    following = false,
    disabled = false,
    loading = false,
    size = 'md',
    variant = 'default',
    followText = 'Follow',
    followingText = 'Following',
    onclick
  }: Props = $props();

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    default: following
      ? 'bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-[var(--status-error-solid)]'
      : 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:bg-[var(--btn-primary-hover)]',
    outline: following
      ? 'border-2 border-gray-300 text-gray-700 hover:border-[var(--status-error-solid)] hover:text-[var(--status-error-solid)]'
      : 'border-2 border-[var(--btn-primary-border)] text-[var(--brand-primary-strong)] hover:bg-[var(--surface-brand-strong)]/5',
    ghost: following
      ? 'text-gray-700 hover:bg-red-50 hover:text-[var(--status-error-solid)]'
      : 'text-[var(--brand-primary-strong)] hover:bg-[var(--surface-brand-strong)]/5'
  };

  const buttonClass = $derived(`
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    rounded-lg
    font-medium
    transition-all duration-200
    ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    flex items-center justify-center gap-2
    min-w-[100px]
  `.trim().replace(/\s+/g, ' '));

  const displayText = $derived(following ? followingText : followText);
</script>

<button
  type="button"
  class={buttonClass}
  disabled={disabled || loading}
  onclick={onclick}
  aria-label={displayText}
>
  {#if loading}
    <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  {:else if following}
    <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
    </svg>
  {:else}
    <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
    </svg>
  {/if}
  
  <span>{displayText}</span>
</button>

<style>
  button {
    -webkit-tap-highlight-color: transparent;
  }
</style>
