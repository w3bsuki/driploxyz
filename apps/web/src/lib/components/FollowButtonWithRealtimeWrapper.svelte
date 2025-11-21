<!--
  Wrapper for FollowButton that provides real-time functionality
  This bridges the UI package component with app-specific services
-->
<script lang="ts">
  import { FollowButton } from '@repo/ui';
  import { followActions } from '$lib/utils/realtimeSetup';

  interface Props {
    userId: string;
    following?: boolean;
    onFollow?: () => void;
    followText?: string;
    unfollowText?: string;
    variant?: 'default' | 'outline' | 'ghost';
    disabled?: boolean;
  }

  let {
    userId,
    following = false,
  onFollow,
  followText,
  unfollowText,
    variant = 'default',
    disabled = false
  }: Props = $props();

  // Follower counts are managed elsewhere; UI button doesn't display counts

  // Real-time updates are disabled until the service is implemented

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
  {following}
  followText={followText}
  followingText={unfollowText}
  {variant}
  {disabled}
  onclick={onFollow || handleFollow}
/>