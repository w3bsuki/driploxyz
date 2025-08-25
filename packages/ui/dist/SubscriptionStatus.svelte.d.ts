import type { Profile } from './types/index.js';
interface UserSubscription {
    id: string;
    user_id: string;
    plan_id?: string;
    status: string;
    amount_paid?: number;
    currency?: string;
    discount_code?: string;
    discount_percent?: number;
    cancel_at_period_end?: boolean;
}
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