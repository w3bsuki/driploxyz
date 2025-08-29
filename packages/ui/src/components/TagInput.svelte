<script lang="ts">
  interface Props {
    tags?: string[];
    label?: string;
    placeholder?: string;
    suggestions?: string[];
    error?: string;
    helpText?: string;
    maxTags?: number;
  }

  let {
    tags = $bindable([]),
    label = 'Tags',
    placeholder = 'Add a tag...',
    suggestions = [],
    error,
    helpText,
    maxTags = 10
  }: Props = $props();

  let inputValue = $state('');
  let showSuggestions = $state(false);
  let inputElement: HTMLInputElement;

  const filteredSuggestions = $derived(
    suggestions.filter(s => 
      s.toLowerCase().includes(inputValue.toLowerCase()) && 
      !tags.includes(s)
    )
  );

  function addTag(tag: string) {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      tags = [...tags, trimmedTag];
      inputValue = '';
      showSuggestions = false;
    }
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag(inputValue);
    } else if (event.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  }

  function selectSuggestion(suggestion: string) {
    addTag(suggestion);
    inputElement?.focus();
  }
</script>

<div class="w-full">
  {#if label}
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
  {/if}

  <div class="relative">
    <div 
      class="min-h-10 px-3 py-2 border rounded-lg flex flex-wrap gap-2 items-center cursor-text
        {error 
          ? 'border-red-300 focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500' 
          : 'border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500'}"
      onclick={() => inputElement?.focus()}
      role="button"
      tabindex="0"
    >
      {#each tags as tag, index}
        <span class="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
          {tag}
          <button
            type="button"
            onclick={() => removeTag(index)}
            class="hover:text-blue-900"
            aria-label="Remove tag"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      {/each}
      
      {#if tags.length < maxTags}
        <input
          bind:this={inputElement}
          bind:value={inputValue}
          type="text"
          {placeholder}
          class="flex-1 min-w-[120px] outline-none text-sm"
          onkeydown={handleKeyDown}
          onfocus={() => showSuggestions = true}
          onblur={() => setTimeout(() => showSuggestions = false, 200)}
        />
      {/if}
    </div>

    {#if showSuggestions && filteredSuggestions.length > 0 && inputValue}
      <div class="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
        {#each filteredSuggestions as suggestion}
          <button
            type="button"
            onclick={() => selectSuggestion(suggestion)}
            class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
          >
            {suggestion}
          </button>
        {/each}
      </div>
    {/if}
  </div>

  <div class="mt-2 flex items-center justify-between">
    <div>
      {#if helpText && !error}
        <p class="text-sm text-gray-500">{helpText}</p>
      {/if}
      {#if error}
        <p class="text-sm text-red-600">{error}</p>
      {/if}
    </div>
    <span class="text-xs text-gray-500">
      {tags.length}/{maxTags}
    </span>
  </div>
</div>