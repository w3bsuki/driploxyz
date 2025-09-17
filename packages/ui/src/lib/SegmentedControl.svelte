<script lang="ts">
  interface Option {
    value: string;
    label: string;
    badge?: string | number | null;
    description?: string;
  }

  interface Props {
    options?: Option[];
    value?: string;
    ariaLabel?: string;
    onChange?: (value: string) => void;
  }

  let {
    options = [],
    value = $bindable(options[0]?.value ?? ''),
    ariaLabel = 'Select option',
    onChange
  }: Props = $props();

  let containerEl = $state<HTMLDivElement | null>(null);
  let focusedIndex = $state(Math.max(options.findIndex((option) => option.value === value), 0));

  $effect(() => {
    const currentIndex = options.findIndex((option) => option.value === value);
    if (currentIndex >= 0 && currentIndex !== focusedIndex) {
      focusedIndex = currentIndex;
    }
  });

  function selectOption(optionValue: string) {
    if (!optionValue || optionValue === value) return;
    value = optionValue;
    onChange?.(optionValue);
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    const last = options.length - 1;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = index === last ? 0 : index + 1;
        focusButton(focusedIndex);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = index === 0 ? last : index - 1;
        focusButton(focusedIndex);
        break;
      case 'Home':
        event.preventDefault();
        focusedIndex = 0;
        focusButton(focusedIndex);
        break;
      case 'End':
        event.preventDefault();
        focusedIndex = last;
        focusButton(focusedIndex);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectOption(options[index]?.value ?? value);
        break;
    }
  }

  function focusButton(index: number) {
    const buttons = containerEl?.querySelectorAll<HTMLButtonElement>('button[data-segment-option="true"]');
    buttons?.[index]?.focus();
  }
</script>

<div
  bind:this={containerEl}
  class="flex items-center gap-1 bg-[color:var(--surface-subtle)] p-1 rounded-xl"
  role="tablist"
  aria-label={ariaLabel}
>
  {#each options as option, index}
    <button
      type="button"
      role="tab"
      data-segment-option="true"
      onclick={() => selectOption(option.value)}
      onkeydown={(event) => handleKeydown(event, index)}
      class="flex-1 min-h-11 px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--brand-primary)]
        {option.value === value
          ? 'bg-[color:var(--surface-base)] text-[color:var(--text-emphasis)] shadow-sm'
          : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-base)]/80'}"
      aria-selected={option.value === value}
      tabindex={option.value === value ? 0 : -1}
    >
      <span class="flex flex-col items-center justify-center gap-1">
        <span class="flex items-center justify-center gap-1">
          <span>{option.label}</span>
          {#if option.badge !== undefined && option.badge !== null && String(option.badge).length > 0}
            <span class="inline-flex items-center justify-center min-w-[1.5rem] px-1 py-0.5 text-xs font-semibold rounded-full bg-[color:var(--surface-strong)] text-[color:var(--text-secondary)]">
              {option.badge}
            </span>
          {/if}
        </span>
        {#if option.description}
          <span class="text-[0.65rem] font-normal text-[color:var(--text-muted)] tracking-wide">
            {option.description}
          </span>
        {/if}
      </span>
    </button>
  {/each}
</div>
