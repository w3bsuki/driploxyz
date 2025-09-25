<!--
  Wrapper for FollowButton that provides real-time functionality
  This bridges the UI package component with app-specific services
-->
<script lang="ts">
  import { FollowButton } from '@repo/ui';
  import {
    realtimeService,
    realtimeStore,
    followStore,
    followActions
  } from '$lib/utils/realtimeSetup';

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
  }

  let {
    userId,
    username,
    following = false,
    onFollow,
    followText,
    unfollowText,
    showCount = true,
    variant = 'default',
    disabled = false
  }: Props = $props();

  // Get follower count from real-time store or follow store
  const followerCount = $derived.by(() => {
    const realtimeMetrics = realtimeStore.state.metrics.userMetrics[userId];
    const followMetrics = followStore.followerCounts[userId];
    return realtimeMetrics?.follower_count ?? followMetrics ?? 0;
  });

  // Subscribe to real-time updates for this user
  $effect(() => {
    if (realtimeService.instance && userId) {
      realtimeService.instance.subscribeToUser(userId);
    }

    return () => {
      if (realtimeService.instance && userId) {
        realtimeService.instance.unsubscribeFromUser(userId);
      }
    };
  });

  async function handleFollow() {
    if (!userId) return;

    try {
      await followActions.toggleFollow(userId);
    } catch {
      // Intentionally empty - errors are handled by followActions internally
    }
  }
</script>

<FollowButton
  {userId}
  {username}
  {following}
  onFollow={onFollow || handleFollow}
  {followText}
  {unfollowText}
  {showCount}
  {variant}
  {disabled}
  {followActions}
  realtimeService={realtimeService.instance}
  realtimeStore={realtimeStore}
  followerCount={followerCount()}
/>