<!--
@component PayoutRequestModal - Lightweight payout request form
Creates payout requests via Supabase RPC calls
-->
<script lang="ts">
	import { Button, Input, Select, Dialog } from '@repo/ui';

	interface PayoutMethod {
		type: 'revolut' | 'bank_transfer';
		details: {
			account_holder?: string;
			account_number?: string;
			sort_code?: string;
			phone?: string; // For Revolut
			email?: string; // For Revolut
		};
	}

	interface Props {
		isOpen: boolean;
		availableBalance: number;
		currency?: string;
		loading?: boolean;
		onClose: () => void;
		onSubmit: (amount: number, payoutMethod: PayoutMethod) => Promise<void>;
	}

	let { 
		isOpen, 
		availableBalance, 
		currency = 'GBP', 
		loading = false,
		onClose, 
		onSubmit 
	}: Props = $props();

	// Form state
	let amount = $state(0);
	let payoutType = $state<'revolut' | 'bank_transfer'>('revolut');
	let accountHolder = $state('');
	let accountNumber = $state('');
	let sortCode = $state('');
	let phone = $state('');
	let email = $state('');

	// Validation
	const minAmount = 10;
	const maxAmount = $derived(availableBalance);
	const isValidAmount = $derived(amount >= minAmount && amount <= maxAmount);
	const isValidPayoutMethod = $derived(
		payoutType === 'revolut' 
			? (phone.trim() !== '' || email.trim() !== '')
			: (accountHolder.trim() !== '' && accountNumber.trim() !== '' && sortCode.trim() !== '')
	);
	const canSubmit = $derived(isValidAmount && isValidPayoutMethod && !loading);

	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat('en-GB', {
			style: 'currency',
			currency: currency
		}).format(value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!canSubmit) return;

		const payoutMethod: PayoutMethod = {
			type: payoutType,
			details: payoutType === 'revolut' 
				? { phone: phone.trim(), email: email.trim() }
				: { 
					account_holder: accountHolder.trim(), 
					account_number: accountNumber.trim(), 
					sort_code: sortCode.trim() 
				}
		};

		try {
			await onSubmit(amount, payoutMethod);
			// Reset form on success
			amount = 0;
			accountHolder = '';
			accountNumber = '';
			sortCode = '';
			phone = '';
			email = '';
		} catch {
			// Intentionally empty - errors are handled by the parent component
		}
	};

	// handleClose function is defined but never used - removing as onClose is used directly

	// Handle dialog open change for controlled behavior
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen && !loading) {
			onClose();
		}
	};
</script>

<Dialog
	open={isOpen}
	onOpenChange={handleOpenChange}
	class="dialog-payout"
>
	{#snippet title()}
		Request Payout
	{/snippet}

	{#snippet description()}
		Available Balance: {formatCurrency(availableBalance)}
	{/snippet}

	{#snippet children()}
		<form id="payout-form" onsubmit={handleSubmit} class="payout-form">
			<!-- Amount Input -->
			<div class="form-group">
				<label for="amount">Payout Amount</label>
				<div class="amount-input-wrapper">
					<Input
						id="amount"
						type="number"
						min={minAmount}
						max={maxAmount}
						step="0.01"
						bind:value={amount}
						placeholder="Enter amount"
						required
					/>
					<span class="currency-symbol">{currency}</span>
				</div>
				{#if amount > 0}
					<p class="text-xs text-[color:var(--text-muted)] mt-1">
						{#if amount < minAmount}
							Minimum payout is {formatCurrency(minAmount)}
						{:else if amount > maxAmount}
							Amount cannot exceed available balance
						{:else}
							You'll receive {formatCurrency(amount)} (no fees currently)
						{/if}
					</p>
				{/if}
			</div>

			<!-- Payout Method Selection -->
			<div class="form-group">
				<label for="payout-type">Payout Method</label>
				<Select
					id="payout-type"
					bind:value={payoutType}
					options={[
						{ value: 'revolut', label: 'Revolut' },
						{ value: 'bank_transfer', label: 'Bank Transfer' }
					]}
				/>
			</div>

			<!-- Payout Details -->
			{#if payoutType === 'revolut'}
				<div class="payout-details">
					<h4>Revolut Details</h4>
					<div class="form-group">
						<label for="phone">Phone Number (optional)</label>
						<Input
							id="phone"
							type="tel"
							bind:value={phone}
							placeholder="+44 7xxx xxx xxx"
						/>
					</div>
					<div class="form-group">
						<label for="email">Email Address (optional)</label>
						<Input
							id="email"
							type="email"
							bind:value={email}
							placeholder="your@email.com"
						/>
					</div>
					<p class="text-xs text-[color:var(--text-muted)]">
						Provide either phone number or email for Revolut transfer
					</p>
				</div>
			{:else}
				<div class="payout-details">
					<h4>Bank Transfer Details</h4>
					<div class="form-group">
						<label for="account-holder">Account Holder Name</label>
						<Input
							id="account-holder"
							bind:value={accountHolder}
							placeholder="John Smith"
							required
						/>
					</div>
					<div class="form-row">
						<div class="form-group">
							<label for="account-number">Account Number</label>
							<Input
								id="account-number"
								bind:value={accountNumber}
								placeholder="12345678"
								required
							/>
						</div>
						<div class="form-group">
							<label for="sort-code">Sort Code</label>
							<Input
								id="sort-code"
								bind:value={sortCode}
								placeholder="12-34-56"
								required
							/>
						</div>
					</div>
				</div>
			{/if}
		</form>
	{/snippet}

	{#snippet actions()}
		<Button 
			variant="primary" 
			type="submit" 
			form="payout-form"
			disabled={!canSubmit} 
			{loading}
			class="min-h-[44px]"
		>
			{loading ? 'Processing...' : `Request ${formatCurrency(amount || 0)}`}
		</Button>
	{/snippet}
</Dialog>

<style>
	@reference theme();
	
	.payout-form {
		@apply space-y-6 w-full;
	}

	.form-group {
		@apply space-y-2;
	}

	.form-group label {
		@apply block text-sm font-medium text-[color:var(--text-primary)];
	}

	.amount-input-wrapper {
		@apply relative;
	}

	.currency-symbol {
		@apply absolute right-3 top-1/2 transform -translate-y-1/2 text-[color:var(--text-muted)];
	}

	.form-row {
		@apply grid grid-cols-2 gap-4;
	}

	.payout-details {
		@apply border-t border-[color:var(--border-subtle)] pt-4 space-y-4;
	}

	.payout-details h4 {
		@apply font-medium text-[color:var(--text-primary)];
	}

	/* Modal actions now handled by Dialog primitive's actions section */
</style>