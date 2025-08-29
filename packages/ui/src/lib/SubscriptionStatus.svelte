<!--
@component SubscriptionStatus - Shows current subscription status and expiry
Lightweight component for displaying brand subscription info
-->
<script lang="ts">
	import Badge from './Badge.svelte';
	import Button from './Button.svelte';
	import BrandBadge from './BrandBadge.svelte';
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

	let { profile, subscription, onRenew, onUpgrade }: Props = $props();

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	};

	const getSubscriptionHealth = (subscription?: UserSubscription, profile?: Profile) => {
		if (!subscription || !profile?.subscription_expires_at) {
			return { status: 'none', color: 'gray', text: 'No subscription' };
		}

		const expiryDate = new Date(profile.subscription_expires_at);
		const now = new Date();
		const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

		if (subscription.status === 'active') {
			if (daysUntilExpiry > 7) {
				return { status: 'active', color: 'green', text: 'Active' };
			} else if (daysUntilExpiry > 0) {
				return { status: 'expiring', color: 'orange', text: `Expires in ${daysUntilExpiry} days` };
			} else {
				return { status: 'expired', color: 'red', text: 'Expired' };
			}
		}

		return { status: subscription.status, color: 'gray', text: subscription.status };
	};

	const subscriptionHealth = $derived(getSubscriptionHealth(subscription, profile));
	const isBrandAccount = $derived(profile.account_type === 'brand');
	const hasActiveSubscription = $derived(subscription?.status === 'active');
</script>

<div class="subscription-status">
	<div class="status-header">
		<div class="account-type">
			<h3>Account Status</h3>
			{#if isBrandAccount}
				<BrandBadge verified={profile.verification_status === 'verified'} />
			{:else}
				<Badge variant="secondary">Free Account</Badge>
			{/if}
		</div>
		<Badge variant={subscriptionHealth.color === 'green' ? 'success' : 
						subscriptionHealth.color === 'orange' ? 'warning' : 
						subscriptionHealth.color === 'red' ? 'danger' : 'secondary'}>
			{subscriptionHealth.text}
		</Badge>
	</div>

	{#if hasActiveSubscription && subscription}
		<div class="subscription-details">
			<div class="detail-grid">
				<div class="detail-item">
					<span class="label">Plan Type:</span>
					<span class="value capitalize">{subscription.plan_id || profile.subscription_tier}</span>
				</div>
				
				{#if profile.subscription_expires_at}
					<div class="detail-item">
						<span class="label">Expires:</span>
						<span class="value">{formatDate(profile.subscription_expires_at)}</span>
					</div>
				{/if}

				{#if subscription.amount_paid}
					<div class="detail-item">
						<span class="label">Last Payment:</span>
						<span class="value">
							{new Intl.NumberFormat('en-GB', {
								style: 'currency',
								currency: subscription.currency || 'GBP'
							}).format(Number(subscription.amount_paid))}
						</span>
					</div>
				{/if}

				{#if subscription.discount_code}
					<div class="detail-item">
						<span class="label">Discount Used:</span>
						<span class="value">
							{subscription.discount_code}
							{#if subscription.discount_percent}
								({subscription.discount_percent}% off)
							{/if}
						</span>
					</div>
				{/if}
			</div>

			<!-- Auto-renewal status -->
			{#if subscription.cancel_at_period_end}
				<div class="renewal-notice warning">
					<div class="notice-icon">⚠️</div>
					<div class="notice-content">
						<h4>Subscription will not renew</h4>
						<p>Your subscription will end on {formatDate(profile.subscription_expires_at || '')}. 
						   Renew to continue using Brand features.</p>
					</div>
				</div>
			{:else if subscriptionHealth.status === 'expiring'}
				<div class="renewal-notice info">
					<div class="notice-icon">ℹ️</div>
					<div class="notice-content">
						<h4>Subscription expiring soon</h4>
						<p>Your Brand subscription will expire soon. Renew now to avoid interruption.</p>
					</div>
				</div>
			{/if}
		</div>
	{:else if profile.account_type === 'brand' && subscriptionHealth.status === 'expired'}
		<div class="expired-notice">
			<div class="notice-icon">🚫</div>
			<div class="notice-content">
				<h4>Brand subscription expired</h4>
				<p>Your Brand features are currently disabled. Renew your subscription to restore access.</p>
			</div>
		</div>
	{:else}
		<div class="upgrade-prompt">
			<div class="prompt-content">
				<h4>Upgrade to Brand Pro</h4>
				<ul class="benefits-list">
					<li>✅ Unlimited listings</li>
					<li>✅ Brand verification badge</li>
					<li>✅ Priority placement</li>
					<li>✅ Advanced analytics</li>
					<li>✅ Priority support</li>
				</ul>
			</div>
		</div>
	{/if}

	<!-- Action buttons -->
	<div class="actions">
		{#if subscriptionHealth.status === 'expired' || subscriptionHealth.status === 'expiring'}
			<Button variant="primary" onclick={onRenew}>
				Renew Subscription
			</Button>
		{:else if !hasActiveSubscription}
			<Button variant="primary" onclick={onUpgrade}>
				Upgrade to Brand Pro
			</Button>
		{/if}
	</div>
</div>

<style>
	@reference theme();
	
	.subscription-status {
		@apply bg-white rounded-lg border p-6 space-y-6;
	}

	.status-header {
		@apply flex justify-between items-center;
	}

	.account-type {
		@apply flex items-center gap-3;
	}

	.account-type h3 {
		@apply text-xl font-semibold;
	}

	.subscription-details {
		@apply space-y-4;
	}

	.detail-grid {
		@apply grid grid-cols-1 md:grid-cols-2 gap-4;
	}

	.detail-item {
		@apply flex justify-between items-center py-2 border-b border-gray-100;
	}

	.label {
		@apply text-sm font-medium text-gray-600;
	}

	.value {
		@apply text-sm text-gray-900;
	}

	.renewal-notice, .expired-notice {
		@apply flex gap-3 p-4 rounded-lg;
	}

	.renewal-notice.warning {
		@apply bg-orange-50 border border-orange-200;
	}

	.renewal-notice.info {
		@apply bg-blue-50 border border-blue-200;
	}

	.expired-notice {
		@apply bg-red-50 border border-red-200;
	}

	.notice-icon {
		@apply text-xl;
	}

	.notice-content h4 {
		@apply font-medium text-gray-900 mb-1;
	}

	.notice-content p {
		@apply text-sm text-gray-700;
	}

	.upgrade-prompt {
		@apply bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6;
	}

	.prompt-content h4 {
		@apply text-lg font-semibold text-gray-900 mb-4;
	}

	.benefits-list {
		@apply space-y-2;
	}

	.benefits-list li {
		@apply text-sm text-gray-700;
	}

	.actions {
		@apply flex justify-center border-t pt-4;
	}

	.capitalize {
		text-transform: capitalize;
	}
</style>