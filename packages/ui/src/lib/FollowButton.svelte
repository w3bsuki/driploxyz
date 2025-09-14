<!--
  Follow Button with real-time updates
  Handles user following/unfollowing with optimistic updates and real-time count updates
-->
<script lang="ts">
  import { Tooltip } from './primitives/tooltip';
  // Note: These imports need to be passed as props since UI package cannot import from apps
  interface FollowActions {
    toggleFollow: (userId: string) => Promise<boolean>;
  }

  interface RealtimeStore {
    metrics: {
      userMetrics: Record<string, { follower_count: number; following_count: number }>;
    };
  }

  interface RealtimeService {
    subscribeToUser: (userId: string) => void;
    unsubscribeFromUser: (userId: string) => void;
  }

  interface Props {
    userId: string;
    username?: string;
    following?: boolean;
    onFollow?: () => void;
    followText?: string;
    unfollowText?: string;
    showCount?: boolean;
    variant?: 'default' | 'compact' | 'text';
    disabled?: boolean;
    // Services passed from parent
    followActions?: FollowActions;
    realtimeService?: RealtimeService;
    realtimeStore?: RealtimeStore;
    followerCount?: number; // Fallback if no realtime
  }

  let {
    userId,
    username,
    following = false,
    onFollow,
    followText = 'Follow',
    unfollowText = 'Following',
    showCount = true,
    variant = 'default',
    disabled = false,
    followActions,
    realtimeService,
    realtimeStore,
    followerCount = 0
  }: Props = $props();

  let isLoading = $state(false);
  let currentFollowing = $derived(following);

  // Get follower count from real-time store or fallback
  let currentFollowerCount = $derived(() => {
    if (realtimeStore) {
      const metrics = realtimeStore.metrics.userMetrics[userId];
      return metrics?.follower_count ?? followerCount;
    }
    return followerCount;
  });

  // Compute tooltip content based on state
  const tooltipContent = $derived(() => {
    if (disabled) {
      return 'Cannot follow this user';
    }
    if (isLoading) {
      return 'Updating...';
    }
    return currentFollowing ? unfollowText : followText;
  });

  // Get button classes based on variant
  const buttonClasses = $derived(() => {
    const base = 'inline-flex items-center gap-2 font-medium transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--state-focus)]';

    if (isLoading || disabled) {
      return `${base} opacity-50 cursor-not-allowed`;
    }

    if (variant === 'compact') {
      return `${base} px-3 py-1.5 text-sm rounded-md ${
        currentFollowing
          ? 'bg-[color:var(--gray-100)] text-[color:var(--text-secondary)] hover:bg-[color:var(--gray-200)]'
          : 'bg-[color:var(--primary)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-hover)]'
      }`;
    }

    if (variant === 'text') {
      return `${base} text-sm ${
        currentFollowing
          ? 'text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]'
          : 'text-[color:var(--primary)] hover:text-[color:var(--primary-hover)]'
      }`;
    }

    // Default variant
    return `${base} px-4 py-2 rounded-lg ${
      currentFollowing
        ? 'bg-[color:var(--gray-100)] text-[color:var(--text-secondary)] hover:bg-[color:var(--gray-200)]'
        : 'bg-[color:var(--primary)] text-[color:var(--primary-fg)] hover:bg-[color:var(--primary-hover)]'
    }`;
  });

  // Initialize real-time subscription
  $effect(() => {
    if (realtimeService) {
      realtimeService.subscribeToUser(userId);
    }

    return () => {
      if (realtimeService) {
        realtimeService.unsubscribeFromUser(userId);
      }
    };
  });

  async function handleFollow(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    if (isLoading || disabled || typeof window === 'undefined') return;

    // If parent provided a handler, delegate to it
    if (onFollow) {
      try {
        isLoading = true;
        await onFollow();
      } finally {
        isLoading = false;
      }
      return;
    }

    if (!followActions) {
      console.warn('Follow actions not available');
      return;
    }

    isLoading = true;

    try {
      const newFollowingState = await followActions.toggleFollow(userId);
      currentFollowing = newFollowingState;
    } catch (error) {
      console.error('[FOLLOW] Error:', error);
    } finally {
      isLoading = false;
    }
  }
</script>

<Tooltip
  content={tooltipContent()}
  positioning={{ side: 'bottom', align: 'center' }}
  openDelay={500}
  closeDelay={200}
  disabled={isLoading}
  forceTouch={true}
>
  {#snippet trigger()}
    <button
      onclick={handleFollow}
      disabled={isLoading || disabled}
      class={buttonClasses()}
      aria-label={`${currentFollowing ? unfollowText : followText} ${username || 'user'}`}
    >
      <!-- Follow/Following Icon -->
      {#if variant !== 'text'}
        <svg
          class="w-4 h-4"
          aria-hidden="true"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="1.5"
          fill="none"
        >
          {#if currentFollowing}
            <!-- Following (check icon) -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
            />
          {:else}
            <!-- Not following (plus icon) -->
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          {/if}
        </svg>
      {/if}

      <!-- Text -->
      <span>
        {currentFollowing ? unfollowText : followText}
      </span>

      <!-- Follower count -->
      {#if showCount && currentFollowerCount() > 0}
        <span class="text-xs opacity-75">
          {currentFollowerCount() > 999 ? `${Math.floor(currentFollowerCount()/1000)}k` : currentFollowerCount()}
        </span>
      {/if}
    </button>
  {/snippet}
</Tooltip>