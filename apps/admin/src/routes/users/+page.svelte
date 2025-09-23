<!--
User Management Page with full admin capabilities
Uses the comprehensive AdminUserBrowser component
-->
<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	interface Props {
		data: PageData;
		form?: ActionData;
	}

	let { data, form = null }: Props = $props();
	
	let loading = $state(false);
	
	// Transform database users to the format expected by AdminUserBrowser
	const transformedUsers = $derived(data.users?.map(user => ({
		id: user.id,
		username: user.username || 'unknown',
		full_name: user.full_name || '',
		email: user.email || '',
		country_code: user.country === 'GB' ? 'UK' : (user.country || 'UK'),
		role: user.role || 'user',
		is_verified: user.is_verified || false,
		subscription_tier: user.subscription_tier || 'free',
		current_balance: user.current_balance || 0,
		total_sales_value: user.total_sales_value || 0,
		sales_count: user._count_orders_as_seller?.[0]?.count || 0,
		purchases_count: user._count_orders_as_buyer?.[0]?.count || 0,
		last_active_at: user.last_active_at || '',
		created_at: user.created_at || '',
		auth_created_at: user.auth_created_at || user.created_at || '',
		last_sign_in_at: user.last_sign_in_at || ''
	})) || []);
	
	const handleSearch = async (query: string, filters: any) => {
		loading = true;
		try {
			// Implement search with query params
			const params = new URLSearchParams($page.url.searchParams);
			
			if (query) {
				params.set('q', query);
			} else {
				params.delete('q');
			}
			
			if (filters.country !== 'all') {
				params.set('country', filters.country);
			} else {
				params.delete('country');
			}
			
			if (filters.status !== 'all') {
				params.set('status', filters.status);
			} else {
				params.delete('status');
			}
			
			if (filters.subscription !== 'all') {
				params.set('subscription', filters.subscription);
			} else {
				params.delete('subscription');
			}
			
			// Navigate to update the URL and reload data
			await goto(`?${params.toString()}`);
		} finally {
			loading = false;
		}
	};
	
	const handleUserAction = async (action: string, userId: string) => {
		switch (action) {
			case 'view_profile':
				await goto(`/users/${userId}`);
				break;
			case 'view_listings':
				await goto(`/listings?user=${userId}`);
				break;
			case 'process_payout':
				await goto(`/payouts?user=${userId}`);
				break;
			case 'suspend_user':
				// Trigger form submission for ban
				const formEl = document.getElementById('ban-form') as HTMLFormElement;
				if (formEl) {
					const userInput = formEl.querySelector('input[name="userId"]') as HTMLInputElement;
					if (userInput) {
						userInput.value = userId;
						formEl.requestSubmit();
					}
				}
				break;
		}
	};
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Page Header with Stats -->
	<div class="bg-white shadow mb-6">
		<div class="container mx-auto px-4 py-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">User Management</h1>
					<p class="text-gray-600 mt-1">Manage users across UK and Bulgaria</p>
				</div>
				<div class="flex gap-4">
					<div class="text-center">
						<div class="text-2xl font-bold text-gray-900">{data.stats?.total || 0}</div>
						<div class="text-xs text-gray-500">Total Users</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-600">{data.stats?.ukUsers || 0}</div>
						<div class="text-xs text-gray-500">UK Users</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-green-600">{data.stats?.bgUsers || 0}</div>
						<div class="text-xs text-gray-500">BG Users</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-purple-600">{data.stats?.verified || 0}</div>
						<div class="text-xs text-gray-500">Verified</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-yellow-600">{data.stats?.brands || 0}</div>
						<div class="text-xs text-gray-500">Brands</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="container mx-auto px-4 mb-4">
			<div class="bg-green-50 border border-green-200 rounded-lg p-4">
				<p class="text-green-800">Action completed successfully!</p>
			</div>
		</div>
	{/if}

	{#if form?.message}
		<div class="container mx-auto px-4 mb-4">
			<div class="bg-red-50 border border-red-200 rounded-lg p-4">
				<p class="text-red-800">{form.message}</p>
			</div>
		</div>
	{/if}

	<form id="ban-form" method="POST" action="?/banUser" use:enhance class="hidden">
		<input type="hidden" name="userId" />
		<input type="hidden" name="reason" value="Suspended by admin" />
	</form>
	
	<form id="verify-form" method="POST" action="?/verifyUser" use:enhance class="hidden">
		<input type="hidden" name="userId" />
	</form>
	
	<form id="makeadmin-form" method="POST" action="?/makeAdmin" use:enhance class="hidden">
		<input type="hidden" name="userId" />
	</form>
</div>