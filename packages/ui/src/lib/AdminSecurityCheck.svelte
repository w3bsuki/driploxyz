<!--
@component AdminSecurityCheck - Multi-factor admin verification
Requires additional verification for sensitive admin operations
-->
<script lang="ts">
	import Button from './Button.svelte';
	import Input from './Input.svelte';
	import Modal from './Modal.svelte';

	interface Props {
		isOpen: boolean;
		operation: string; // "approve_payout", "reject_payout", "ban_user", etc.
		onClose: () => void;
		onConfirm: (securityCode: string) => Promise<void>;
	}

	let { isOpen, operation, onClose, onConfirm }: Props = $props();

	let securityCode = $state('');
	let loading = $state(false);
	let error = $state('');

	const operationDescriptions: Record<string, string> = {
		approve_payout: 'approve a payout request',
		reject_payout: 'reject a payout request',
		ban_user: 'ban a user account',
		modify_balance: 'modify user balance',
		override_subscription: 'override subscription status'
	};

	const handleConfirm = async (e) => {
		e.preventDefault();
		if (!securityCode.trim()) {
			error = 'Security code is required';
			return;
		}

		loading = true;
		error = '';

		try {
			await onConfirm(securityCode);
			securityCode = '';
		} catch (err) {
			error = err instanceof Error ? err.message : 'Verification failed';
		} finally {
			loading = false;
		}
	};

	const handleClose = () => {
		if (!loading) {
			securityCode = '';
			error = '';
			onClose();
		}
	};
</script>

<Modal {isOpen} onClose={handleClose} title="Admin Security Verification">
	<div class="security-check">
		<div class="warning-notice">
			<div class="warning-icon">⚠️</div>
			<div class="warning-content">
				<h4>Sensitive Admin Operation</h4>
				<p>You are about to <strong>{operationDescriptions[operation] || operation}</strong>.</p>
				<p>This action requires additional verification for security.</p>
			</div>
		</div>

		<form onsubmit={handleConfirm} class="verification-form">
			<div class="form-group">
				<label for="security-code">Enter Admin Security Code</label>
				<Input
					id="security-code"
					type="password"
					bind:value={securityCode}
					placeholder="Enter 6-digit code from authenticator app"
					maxlength="6"
					pattern="[0-9]{6}"
					required
				/>
				{#if error}
					<p class="error-message">{error}</p>
				{/if}
			</div>

			<div class="security-info">
				<h5>Security Measures Active:</h5>
				<ul class="security-list">
					<li>✅ Database-level admin role verification</li>
					<li>✅ JWT token validation</li>
					<li>✅ IP address logging</li>
					<li>✅ Audit trail recording</li>
					<li>✅ Two-factor authentication required</li>
				</ul>
			</div>

			<div class="modal-actions">
				<Button variant="secondary" onclick={handleClose} disabled={loading}>
					Cancel
				</Button>
				<Button variant="danger" type="submit" {loading}>
					{loading ? 'Verifying...' : 'Confirm Action'}
				</Button>
			</div>
		</form>
	</div>
</Modal>

<style>
	.security-check {
		@apply space-y-6;
	}

	.warning-notice {
		@apply bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3;
	}

	.warning-icon {
		@apply text-2xl;
	}

	.warning-content h4 {
		@apply font-semibold text-red-900 mb-2;
	}

	.warning-content p {
		@apply text-sm text-red-800;
	}

	.verification-form {
		@apply space-y-4;
	}

	.form-group {
		@apply space-y-2;
	}

	.form-group label {
		@apply block text-sm font-medium text-gray-700;
	}

	.error-message {
		@apply text-sm text-red-600;
	}

	.security-info {
		@apply bg-green-50 border border-green-200 rounded-lg p-4;
	}

	.security-info h5 {
		@apply font-medium text-green-900 mb-2;
	}

	.security-list {
		@apply space-y-1;
	}

	.security-list li {
		@apply text-sm text-green-800;
	}

	.modal-actions {
		@apply flex justify-end gap-3 border-t pt-4;
	}
</style>