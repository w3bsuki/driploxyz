<script lang="ts">
  import { tick } from 'svelte';

  interface Props {
    /** Number of results found */
    resultCount?: number;
    /** Total number of items before filtering */
    totalItems?: number;
    /** Whether filtering is in progress */
    loading?: boolean;
    /** Custom announcement template */
    announcementTemplate?: (count: number, total: number, loading: boolean) => string;
    /** Delay before announcing changes (ms) */
    announcementDelay?: number;
    /** Custom class for container */
    class?: string;
  }

  let {
    resultCount = 0,
    totalItems = 0,
    loading = false,
    announcementTemplate,
    announcementDelay = 500,
    class: className = ''
  }: Props = $props();

  let announcement = $state('');
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  // Create announcements when result count changes
  $effect(() => {
    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Don't announce during loading or if no meaningful change
    if (loading) {
      return;
    }

    // Debounce announcements to avoid spam
    timeoutId = setTimeout(() => {
      if (announcementTemplate) {
        announcement = announcementTemplate(resultCount, totalItems, loading);
      } else {
        // Generate default announcement
        if (resultCount === 0) {
          announcement = 'No results found. Try adjusting your filters.';
        } else if (resultCount === 1) {
          announcement = '1 result found';
        } else if (resultCount === totalItems && totalItems > 0) {
          announcement = `Showing all ${totalItems} results`;
        } else {
          announcement = `${resultCount} results found`;
          if (totalItems > 0) {
            announcement += ` out of ${totalItems} total items`;
          }
        }
      }
    }, announcementDelay);
  });

  // Clear announcement after it's been read
  $effect(() => {
    if (announcement) {
      const timer = setTimeout(() => {
        announcement = '';
      }, 3000); // Longer duration for result announcements
      
      return () => clearTimeout(timer);
    }
  });

  // Cleanup timeout on unmount
  $effect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  });
</script>

<!-- Live region for filter result announcements -->
{#if announcement}
  <div 
    role="status" 
    aria-live="polite" 
    aria-atomic="true"
    class="sr-only {className}"
  >
    {announcement}
  </div>
{/if}

<style>
  /* Screen reader only text */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>