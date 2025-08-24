import type { Database } from '@repo/database';
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
interface Props {
    profile: Profile;
    subscription?: UserSubscription;
    onRenew?: () => void;
    onUpgrade?: () => void;
}
/**
 * SubscriptionStatus - Shows current subscription status and expiry
 * Lightweight component for displaying brand subscription info
 */
declare const SubscriptionStatus: import("svelte").Component<Props, {}, "">;
type SubscriptionStatus = ReturnType<typeof SubscriptionStatus>;
export default SubscriptionStatus;
//# sourceMappingURL=SubscriptionStatus.svelte.d.ts.map