<script lang="ts">
/**
 * QuickConditionPills - Horizontal scrolling condition filter pills
 * 
 * Features:
 * - Touch-optimized pills (min 44px height)
 * - Horizontal scroll on mobile
 * - Quick toggle without modal
 * - Emoji icons for visual appeal
 * - Smooth animations
 */

interface ConditionOption {
  value: string;
  label: string;
  emoji: string;
  shortLabel?: string;
}

interface Props {
  conditions?: ConditionOption[];
  selectedCondition?: string | null;
  onConditionSelect?: (condition: string | null) => void;
  class?: string;
}

let {
  conditions = [
    { value: 'brand_new_with_tags', label: 'New with Tags', shortLabel: 'New', emoji: '🏷️' },
    { value: 'like_new', label: 'Like New', shortLabel: 'Like New', emoji: '💎' },
    { value: 'good', label: 'Good', shortLabel: 'Good', emoji: '👍' },
    { value: 'fair', label: 'Fair', shortLabel: 'Fair', emoji: '👌' }
  ],
  selectedCondition = null,
  onConditionSelect,
  class: className = ''
}: Props = $props();

function handleConditionClick(value: string) {
  // Toggle: if already selected, deselect
  const newValue = selectedCondition === value ? null : value;
  onConditionSelect?.(newValue);
}
</script>

<!-- Horizontal scrolling pills container -->
<div class="w-full overflow-hidden {className}">
  <!-- Pills wrapper with horizontal scroll (no label) -->
  <div class="flex gap-2 overflow-x-auto pb-1 -mb-1 scrollbar-hide snap-x snap-mandatory">
    {#each conditions as condition (condition.value)}
      {@const isActive = selectedCondition === condition.value}
      <button
        type="button"
        onclick={() => handleConditionClick(condition.value)}
        class="flex items-center justify-center gap-1.5 px-3 h-9
               rounded-lg flex-shrink-0 snap-start
               font-medium text-xs whitespace-nowrap
               transition-all duration-150 ease-out
               focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1
               min-w-[44px]
               {isActive
                 ? 'bg-(--brand-primary) text-(--text-inverse)'
                 : 'bg-(--surface-base) text-(--text-secondary) border border-(--border-subtle) hover:border-(--border-default) active:scale-95'}"
        aria-pressed={isActive}
        aria-label="{condition.label}{isActive ? ' (selected)' : ''}"
      >
        <span class="text-sm leading-none" aria-hidden="true">{condition.emoji}</span>
        <span class="hidden sm:inline">{condition.label}</span>
        <span class="sm:hidden text-[11px] font-semibold">{condition.shortLabel || condition.label}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  /* Hide scrollbar but keep functionality */
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;  /* Chrome, Safari, Opera */
  }

  /* Smooth snap scrolling */
  .snap-x {
    scroll-snap-type: x proximity;
    scroll-padding-left: 1rem;
  }

  .snap-start {
    scroll-snap-align: start;
  }

  /* Custom breakpoint for extra small screens */
  @media (min-width: 375px) {
    .xs\:inline {
      display: inline;
    }
    .xs\:hidden {
      display: none;
    }
  }
</style>