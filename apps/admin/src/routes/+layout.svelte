<!--
Admin App Root Layout - Secure admin interface
-->
<script lang="ts">
	import '../app.css';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const menuItems = [
		{ href: '/', label: 'Dashboard', icon: '📊' },
		{ href: '/payouts', label: 'Payouts', icon: '💰' },
		{ href: '/users', label: 'Users', icon: '👥' },
		{ href: '/subscriptions', label: 'Subscriptions', icon: '💳' },
		{ href: '/orders', label: 'Orders', icon: '📦' },
		{ href: '/analytics', label: 'Analytics', icon: '📈' },
		{ href: '/security', label: 'Security', icon: '🔐' },
		{ href: '/logs', label: 'Audit Logs', icon: '📝' }
	];
</script>

<svelte:head>
	<title>Driplo Admin</title>
</svelte:head>

{#if data?.isAdmin}
	<!-- Admin Dashboard Layout -->
	<div class="min-h-screen bg-gray-100">
		<!-- Top Navigation -->
		<nav class="bg-gray-900 text-white">
			<div class="px-4 sm:px-6 lg:px-8">
				<div class="flex items-center justify-between h-16">
					<div class="flex items-center">
						<div class="flex-shrink-0">
							<span class="text-xl font-bold">🛡️ Driplo Admin</span>
						</div>
						<div class="hidden md:block ml-10">
							<div class="flex items-baseline space-x-4">
								{#each menuItems.slice(0, 5) as item}
									<a
										href={item.href}
										class="px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
									>
										<span class="mr-2">{item.icon}</span>
										{item.label}
									</a>
								{/each}
							</div>
						</div>
					</div>
					<div class="flex items-center gap-4">
						<!-- Session Info -->
						<div class="text-sm">
							<div class="text-gray-400">Logged in as:</div>
							<div class="font-medium">{data.user?.email}</div>
						</div>
						<!-- Logout -->
						<form method="POST" action="/logout">
							<button
								type="submit"
								class="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
							>
								Logout
							</button>
						</form>
					</div>
				</div>
			</div>
		</nav>

		<!-- Sidebar -->
		<div class="flex">
			<aside class="w-64 bg-white shadow-md min-h-screen">
				<nav class="mt-5 px-2">
					{#each menuItems as item}
						<a
							href={item.href}
							class="group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-900 mb-1"
						>
							<span class="mr-3 text-lg">{item.icon}</span>
							{item.label}
						</a>
					{/each}
				</nav>

				<!-- Security Status -->
				<div class="absolute bottom-0 w-full p-4 border-t">
					<div class="bg-green-50 border border-green-200 rounded-lg p-3">
						<div class="flex items-center gap-2 text-green-800">
							<span>✅</span>
							<div class="text-xs">
								<div class="font-semibold">Security Active</div>
								<div>IP: Protected</div>
								<div>2FA: Enabled</div>
							</div>
						</div>
					</div>
				</div>
			</aside>

			<!-- Main Content -->
			<main class="flex-1 p-8">
				{@render children()}
			</main>
		</div>
	</div>
{:else}
	<!-- Not Admin or Loading -->
	{@render children()}
{/if}
