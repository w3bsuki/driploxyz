<script lang="ts">
import type { SearchBarMode } from './types.js';
import { useAnalytics } from '../../hooks/analytics.js';

interface Props {
  mode: SearchBarMode;
  searchQuery: string;
  resultsCount: number;
  loadTime?: number;
  hasFilters?: boolean;
  onFeedback?: (helpful: boolean, reason?: string) => void;
  class?: string;
}

let {
  mode,
  searchQuery,
  resultsCount,
  loadTime = 0,
  hasFilters = false,
  onFeedback,
  class: className = ''
}: Props = $props();

// Analytics hooks
const { trackEmptyStateAction } = useAnalytics();

// Feedback state
let feedbackGiven = $state(false);
let feedbackType = $state<'helpful' | 'not-helpful' | null>(null);
let showReasonInput = $state(false);
let feedbackReason = $state('');

// Determine feedback prompt based on context
const feedbackPrompt = $derived(() => {
  if (resultsCount === 0) {
    return {
      question: 'Did our search suggestions help?',
      context: 'no-results'
    };
  } else if (resultsCount < 5) {
    return {
      question: 'Were these results relevant?',
      context: 'few-results'
    };
  } else {
    return {
      question: 'Did you find what you were looking for?',
      context: 'many-results'
    };
  }
});

// Performance indicator
const performanceIndicator = $derived(() => {
  if (loadTime === 0) return null;

  if (loadTime < 500) {
    return { text: 'Lightning fast', color: 'text-green-600', icon: '⚡' };
  } else if (loadTime < 1000) {
    return { text: 'Quick search', color: 'text-blue-600', icon: '🚀' };
  } else {
    return { text: 'Search complete', color: 'text-gray-600', icon: '✓' };
  }
});

function handleFeedback(helpful: boolean) {
  feedbackType = helpful ? 'helpful' : 'not-helpful';

  if (!helpful) {
    showReasonInput = true;
  } else {
    feedbackGiven = true;
    trackEmptyStateAction('feedback_positive', mode, searchQuery);
    onFeedback?.(helpful);
  }
}

function submitDetailedFeedback() {
  if (feedbackType === 'not-helpful') {
    feedbackGiven = true;
    trackEmptyStateAction('feedback_negative', mode, `${searchQuery}|${feedbackReason}`);
    onFeedback?.(false, feedbackReason);
  }
}

function cancelFeedback() {
  feedbackType = null;
  showReasonInput = false;
  feedbackReason = '';
}
</script>

<div class="search-feedback {className}" role="region" aria-label="Search feedback">
  <!-- Performance indicator -->
  {#if performanceIndicator() && mode === 'full'}
    <div class="flex items-center justify-between text-[length:var(--text-xs)] text-[color:var(--text-tertiary)] mb-2">
      <div class="flex items-center gap-1">
        <span>{performanceIndicator()?.icon}</span>
        <span class="{performanceIndicator()?.color}">{performanceIndicator()?.text}</span>
        <span>• {loadTime}ms</span>
      </div>
      <div>
        {resultsCount.toLocaleString()} result{resultsCount !== 1 ? 's' : ''}
        {#if hasFilters}
          <span class="ml-1 px-1.5 py-0.5 bg-[color:var(--surface-subtle)] rounded text-[length:var(--text-xxs)]">
            Filtered
          </span>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Feedback section (only show for certain conditions) -->
  {#if (resultsCount === 0 || (resultsCount > 0 && resultsCount < 20)) && mode !== 'compact' && !feedbackGiven}
    <div class="bg-[color:var(--surface-subtle)]/50 border border-[color:var(--border-subtle)] rounded-lg p-3 mt-4">
      {#if !showReasonInput}
        <!-- Initial feedback prompt -->
        <div class="flex items-center justify-between">
          <p class="text-[length:var(--text-sm)] text-[color:var(--text-secondary)]">
            {feedbackPrompt().question}
          </p>
          <div class="flex items-center gap-2 ml-4">
            <button
              onclick={() => handleFeedback(true)}
              class="flex items-center gap-1 px-3 py-1.5 h-8 min-h-8 text-[length:var(--text-xs)] font-medium text-green-700 hover:text-green-800 bg-green-50 hover:bg-green-100 border border-green-200 rounded-md transition-colors duration-200"
              aria-label="Mark search as helpful"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              Yes
            </button>
            <button
              onclick={() => handleFeedback(false)}
              class="flex items-center gap-1 px-3 py-1.5 h-8 min-h-8 text-[length:var(--text-xs)] font-medium text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 rounded-md transition-colors duration-200"
              aria-label="Mark search as not helpful"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.106-1.79l-.05-.025A4 4 0 0011.057 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
              </svg>
              No
            </button>
          </div>
        </div>
      {:else}
        <!-- Detailed feedback input -->
        <div class="space-y-3">
          <p class="text-[length:var(--text-sm)] text-[color:var(--text-secondary)]">
            Help us improve your search experience:
          </p>
          <div class="space-y-2">
            <label class="block">
              <span class="text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)]">
                What would have been more helpful?
              </span>
              <textarea
                bind:value={feedbackReason}
                placeholder="e.g., 'More size options', 'Different brands', 'Better filters'..."
                class="mt-1 w-full px-3 py-2 text-[length:var(--text-sm)] border border-[color:var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows="2"
                maxlength="200"
              ></textarea>
            </label>
          </div>
          <div class="flex items-center gap-2">
            <button
              onclick={submitDetailedFeedback}
              disabled={!feedbackReason.trim()}
              class="px-3 py-1.5 h-8 min-h-8 text-[length:var(--text-xs)] font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
            >
              Submit
            </button>
            <button
              onclick={cancelFeedback}
              class="px-3 py-1.5 h-8 min-h-8 text-[length:var(--text-xs)] font-medium text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] bg-transparent hover:bg-[color:var(--surface-subtle)] rounded-md transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  <!-- Thank you message -->
  {#if feedbackGiven}
    <div class="bg-green-50 border border-green-200 rounded-lg p-3 mt-4" role="status">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <p class="text-[length:var(--text-sm)] font-medium text-green-800">
          Thank you for your feedback!
        </p>
      </div>
    </div>
  {/if}
</div>

<style>
  .search-feedback {
    position: relative;
  }
</style>