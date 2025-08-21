<script lang="ts">
  interface Props {
    tags?: string[];
    maxTags?: number;
    label?: string;
    placeholder?: string;
    error?: string;
    helpText?: string;
    disabled?: boolean;
    suggestions?: string[];
    class?: string;
    name?: string;
    onTagsChange?: (tags: string[]) => void;
  }

  let { 
    tags = $bindable([]),
    maxTags = 10,
    label,
    placeholder = 'Add a tag and press Enter',
    error,
    helpText,
    disabled = false,
    suggestions = [],
    class: className = '',
    name,
    onTagsChange
  }: Props = $props();

  let inputValue = $state('');
  let inputElement = $state<HTMLInputElement>();
  let showSuggestions = $state(false);

  const filteredSuggestions = $derived(
    suggestions.filter(s => 
      inputValue && 
      !tags.includes(s) && 
      s.toLowerCase().includes(inputValue.toLowerCase())
    )
  );

  function addTag(tag: string) {
    const trimmedTag = tag.trim().toLowerCase();
    
    if (!trimmedTag || disabled) return;
    if (tags.includes(trimmedTag)) {
      inputValue = '';
      return;
    }
    if (tags.length >= maxTags) {
      return;
    }
    
    tags = [...tags, trimmedTag];
    inputValue = '';
    showSuggestions = false;
    onTagsChange?.(tags);
  }

  function removeTag(index: number) {
    if (disabled) return;
    tags = tags.filter((_, i) => i !== index);
    onTagsChange?.(tags);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  function handleInputFocus() {
    if (filteredSuggestions.length > 0) {
      showSuggestions = true;
    }
  }

  function handleInputBlur() {
    // Delay to allow suggestion click
    setTimeout(() => {
      showSuggestions = false;
    }, 200);
  }

  function selectSuggestion(suggestion: string) {
    addTag(suggestion);
  }
</script>

<div class={`tag-input ${className}`}>
  {#if label}
    <div class="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </div>
  {/if}

  <div class="p-1">
    <div class="relative">
      <div class="min-h-[42px] rounded-lg border px-3 py-2 flex flex-wrap gap-2 items-center transition-all duration-200 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 focus-within:border-blue-500
      {error 
        ? 'border-red-300 focus-within:ring-red-500 focus-within:border-red-500' 
        : 'border-gray-300'}
      {disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}">
      
      {#each tags as tag, index}
        <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700
          {disabled ? 'opacity-60' : ''}">
          #{tag}
          {#if !disabled}
            <button
              type="button"
              onclick={() => removeTag(index)}
              class="text-gray-500 hover:text-gray-700 focus:outline-hidden"
              aria-label="Remove tag {tag}"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          {/if}
        </span>
      {/each}
      
      {#if tags.length < maxTags && !disabled}
        <input
          bind:this={inputElement}
          type="text"
          bind:value={inputValue}
          {placeholder}
          {disabled}
          onkeydown={handleKeydown}
          onfocus={handleInputFocus}
          onblur={handleInputBlur}
          class="flex-1 min-w-[120px] outline-hidden text-sm bg-transparent placeholder-gray-400"
          aria-label="Add new tag"
        />
      {/if}
      </div>

      {#if showSuggestions && filteredSuggestions.length > 0}
        <div class="absolute z-10 mt-1 w-full bg-white rounded-lg border border-gray-200 shadow-lg max-h-48 overflow-auto">
        {#each filteredSuggestions as suggestion}
          <button
            type="button"
            onclick={() => selectSuggestion(suggestion)}
            class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-hidden"
          >
            #{suggestion}
          </button>
        {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="flex items-center justify-between mt-1">
    {#if error}
      <p class="text-sm text-red-600">{error}</p>
    {:else if helpText}
      <p class="text-xs text-gray-500">{helpText}</p>
    {:else}
      <span></span>
    {/if}
    
    <span class="text-xs text-gray-500">
      {tags.length}/{maxTags} tags
    </span>
  </div>

  {#if name}
    <input type="hidden" {name} value={JSON.stringify(tags)} />
  {/if}
</div>