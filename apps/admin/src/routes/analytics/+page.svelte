<script lang="ts">
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<div class="min-h-screen bg-gray-50">
	<div class="container mx-auto px-4 py-8">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">📈 Analytics</h1>
			<p class="text-gray-600 mt-2">Platform performance metrics and insights</p>
		</div>

		<!-- Revenue Overview -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Monthly Revenue</h3>
				<p class="text-3xl font-bold text-green-600">£{data.revenue.monthlyRevenue}</p>
				<p class="text-sm text-gray-500 mt-1">Total sales this month</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Platform Commission</h3>
				<p class="text-3xl font-bold text-purple-600">£{data.revenue.monthlyCommission}</p>
				<p class="text-sm text-gray-500 mt-1">10% of monthly revenue</p>
			</div>
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-2">Average Order Value</h3>
				<p class="text-3xl font-bold text-blue-600">£{data.revenue.averageOrderValue}</p>
				<p class="text-sm text-gray-500 mt-1">Per transaction</p>
			</div>
		</div>

		<!-- User Growth -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
			<div class="grid grid-cols-3 gap-4">
				<div>
					<p class="text-sm text-gray-600">Today</p>
					<p class="text-2xl font-bold text-gray-900">+{data.userGrowth.today}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">This Week</p>
					<p class="text-2xl font-bold text-gray-900">+{data.userGrowth.week}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">This Month</p>
					<p class="text-2xl font-bold text-gray-900">+{data.userGrowth.month}</p>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
			<!-- Top Categories -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Top Selling Categories</h3>
				{#if data.topCategories.length > 0}
					<div class="space-y-3">
						{#each data.topCategories as category, i}
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<span class="text-sm font-medium text-gray-600 w-6">#{i + 1}</span>
									<span class="ml-3 text-sm font-medium text-gray-900">{category.category}</span>
								</div>
								<span class="text-sm text-gray-500">{category.count} sales</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500">No sales data available</p>
				{/if}
			</div>

			<!-- Top Sellers -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">Top Sellers (30 days)</h3>
				{#if data.topSellers.length > 0}
					<div class="space-y-3">
						{#each data.topSellers as seller, i}
							<div class="flex items-center justify-between">
								<div class="flex items-center">
									<span class="text-sm font-medium text-gray-600 w-6">#{i + 1}</span>
									<div class="ml-3 flex items-center">
										{#if seller.avatar_url}
											<img class="h-6 w-6 rounded-full" src={seller.avatar_url} alt="">
										{:else}
											<div class="h-6 w-6 rounded-full bg-gray-300"></div>
										{/if}
										<span class="ml-2 text-sm font-medium text-gray-900">{seller.username}</span>
									</div>
								</div>
								<div class="text-right">
									<p class="text-sm font-medium text-gray-900">£{seller.revenue.toFixed(2)}</p>
									<p class="text-xs text-gray-500">{seller.orders} orders</p>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-gray-500">No sales data available</p>
				{/if}
			</div>
		</div>

		<!-- Platform Metrics -->
		<div class="bg-white rounded-lg shadow p-6">
			<h3 class="text-lg font-semibold text-gray-900 mb-4">Platform Metrics</h3>
			<div class="grid grid-cols-2 md:grid-cols-5 gap-4">
				<div>
					<p class="text-sm text-gray-600">Total Listings</p>
					<p class="text-2xl font-bold text-gray-900">{data.metrics.totalListings}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Active Listings</p>
					<p class="text-2xl font-bold text-green-600">{data.metrics.activeListings}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Total Orders</p>
					<p class="text-2xl font-bold text-blue-600">{data.metrics.totalOrders}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Completed Orders</p>
					<p class="text-2xl font-bold text-purple-600">{data.metrics.completedOrders}</p>
				</div>
				<div>
					<p class="text-sm text-gray-600">Conversion Rate</p>
					<p class="text-2xl font-bold text-orange-600">{data.metrics.conversionRate}%</p>
				</div>
			</div>
		</div>
	</div>
</div>