<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let stats = $state({
		totalUsers: 0,
		activeListings: 0,
		pendingPayouts: 0,
		totalRevenue: 0
	});

	onMount(async () => {
		// Load dashboard stats
		const response = await fetch('/api/stats');
		if (response.ok) {
			stats = await response.json();
		}
	});
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
			<p class="text-gray-600 mt-2">Welcome back, {data.user?.email}</p>
		</div>

		<!-- Quick Stats -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Total Users</p>
						<p class="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
					</div>
					<div class="p-3 bg-blue-100 rounded-full">
						<svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Active Listings</p>
						<p class="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
					</div>
					<div class="p-3 bg-green-100 rounded-full">
						<svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Pending Payouts</p>
						<p class="text-2xl font-bold text-gray-900">{stats.pendingPayouts}</p>
					</div>
					<div class="p-3 bg-yellow-100 rounded-full">
						<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
				</div>
			</div>

			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center justify-between">
					<div>
						<p class="text-sm font-medium text-gray-600">Total Revenue</p>
						<p class="text-2xl font-bold text-gray-900">£{stats.totalRevenue}</p>
					</div>
					<div class="p-3 bg-purple-100 rounded-full">
						<svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
				<a href="/payouts" class="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
					</svg>
					Manage Payouts
				</a>
				<a href="/users" class="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
					</svg>
					View Users
				</a>
				<a href="/listings" class="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
					</svg>
					Manage Listings
				</a>
			</div>
		</div>

		<!-- Recent Activity -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
			<div class="space-y-4">
				<div class="flex items-center justify-between py-3 border-b">
					<div class="flex items-center">
						<div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
						<div>
							<p class="text-sm font-medium text-gray-900">New user registered</p>
							<p class="text-xs text-gray-500">user@example.com - 2 minutes ago</p>
						</div>
					</div>
				</div>
				<div class="flex items-center justify-between py-3 border-b">
					<div class="flex items-center">
						<div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
						<div>
							<p class="text-sm font-medium text-gray-900">Payout requested</p>
							<p class="text-xs text-gray-500">£250.00 - 15 minutes ago</p>
						</div>
					</div>
				</div>
				<div class="flex items-center justify-between py-3">
					<div class="flex items-center">
						<div class="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
						<div>
							<p class="text-sm font-medium text-gray-900">New listing created</p>
							<p class="text-xs text-gray-500">Vintage Denim Jacket - 1 hour ago</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>