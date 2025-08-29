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
	.security-check > * + * {
		margin-top: 1.5rem;
	}

	.warning-notice {
		background-color: oklch(0.97 0.02 0);
		border: 1px solid oklch(0.88 0.06 0);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		gap: 0.75rem;
	}

	.warning-icon {
		font-size: 1.5rem;
	}

	.warning-content h4 {
		font-weight: 600;
		color: oklch(0.18 0.08 0);
		margin-bottom: 0.5rem;
	}

	.warning-content p {
		font-size: 0.875rem;
		color: oklch(0.28 0.12 0);
	}

	.verification-form > * + * {
		margin-top: 1rem;
	}

	.form-group > * + * {
		margin-top: 0.5rem;
	}

	.form-group label {
		display: block;
		font-size: 0.875rem;
		font-weight: 500;
		color: oklch(0.38 0.025 270);
	}

	.error-message {
		font-size: 0.875rem;
		color: oklch(0.48 0.16 0);
	}

	.security-info {
		background-color: oklch(0.97 0.02 145);
		border: 1px solid oklch(0.88 0.06 145);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.security-info h5 {
		font-weight: 500;
		color: oklch(0.18 0.08 145);
		margin-bottom: 0.5rem;
	}

	.security-list > * + * {
		margin-top: 0.25rem;
	}

	.security-list li {
		font-size: 0.875rem;
		color: oklch(0.28 0.12 145);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		border-top: 1px solid oklch(0.95 0.005 270);
		padding-top: 1rem;
	}
</style>