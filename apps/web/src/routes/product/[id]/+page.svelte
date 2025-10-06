<script lang="ts">
	import { goto } from '$app/navigation';
	import { ProductBreadcrumb, SEOMetaTags, ProductGallery, ProductCard, ConditionBadge, ProductActions, SellerCard, ErrorBoundary } from '@repo/ui';
	import { Heart, Clock } from '@lucide/svelte';
	import { buildProductUrl } from '$lib/utils/seo-urls';
	import type { PageData } from './$types';
	import * as m from '@repo/i18n';

	let { data }: { data: PageData } = $props();

	// Since this is a legacy route, we should have already redirected in the server
	// But if we're here, it means the product doesn't have a proper slug/seller
	// Generate a basic canonical URL
	const canonicalUrl = `/product/${data.product.id}`;

	// State (simplified)
	let isLiked = $state(data.isFavorited);
	let favoriteCount = $state<number>(data.product.favorite_count || 0);
	let descExpanded = $state(false);
	// Lazy sections control
	const hasSimilar = (data.similarProducts?.length || 0) > 0;
	const hasSeller = (data.sellerProducts?.length || 0) > 0;
	let showSimilar = $state(false);
	let showSeller = $state(false);
	let sentinel: HTMLElement | null = $state(null);

	// Lazy load similar/seller sections when sentinel is visible
	$effect(() => {
		if (!hasSimilar && !hasSeller) return;
		if (typeof IntersectionObserver === 'undefined') {
			showSimilar = hasSimilar;
			showSeller = hasSeller;
			return;
		}
		if (!sentinel) return;

		const io = new IntersectionObserver((entries) => {
			if (entries.some(e => e.isIntersecting)) {
				showSimilar = hasSimilar;
				showSeller = hasSeller;
				io.disconnect();
			}
		}, { rootMargin: '200px' });

		io.observe(sentinel);

		return () => io.disconnect();
	});

	// Actions
	function handleMessage() {
		if (data.user) goto(`/messages?seller=${data.product.seller_id}`);
		else goto('/login');
	}

	function handleBuyNow() {
		if (data.user) goto(`/checkout?product=${data.product.id}`);
		else goto('/login');
	}

	async function handleFavorite() {
		if (!data.user) { goto('/login'); return; }
		try {
			const response = await fetch(`/api/favorites/${data.product.id}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			if (!response.ok) return { favoriteCount, favorited: isLiked };
			const result = await response.json();
			isLiked = result?.favorited ?? !isLiked;
			if (typeof result?.favoriteCount === 'number') favoriteCount = result.favoriteCount;
			else favoriteCount = Math.max(0, favoriteCount + (isLiked ? 1 : -1));
			return { favoriteCount, favorited: isLiked };
		} catch {
			return { favoriteCount, favorited: isLiked };
		}
	}

	function handleMakeOffer() {
		if (!data.user) { goto('/login'); return; }
		goto(`/offer/${data.product.seller_id}?product=${data.product.id}`);
	}

	function handleNavigate(url: string) { goto(url); }

	// SEO metadata
	const seoTitle = [
		data.product.brand,
		data.product.title,
		data.product.size && `Size ${data.product.size}`,
		data.product.condition
	].filter(Boolean).join(' · ');

	const seoDescription = [
		data.product.description || `${data.product.title} by ${data.product.seller_name}`,
		data.product.brand && `Brand: ${data.product.brand}`,
		data.product.size && `Size: ${data.product.size}`,
		data.product.condition && `Condition: ${data.product.condition}`,
		`Price: €${data.product.price}`
	].filter(Boolean).join(' · ').substring(0, 160);

	// Relative date helper: minutes < 60 -> m, hours < 24 -> h, else days -> d
	function formatRelativeDate(input: string | Date) {
		try {
			const d = new Date(input);
			const now = new Date();
			const diffMs = now.getTime() - d.getTime();
			if (!isFinite(diffMs)) return '';
			const mins = Math.floor(diffMs / 60000);
			if (mins < 1) return m.pdp_justNow();
			if (mins < 60) return m.pdp_minutesAgo({ count: mins.toString() });
			const hours = Math.floor(mins / 60);
			if (hours < 24) return m.pdp_hoursAgo({ count: hours.toString() });
			const days = Math.floor(hours / 24);
			return m.pdp_daysAgo({ count: days.toString() });
		} catch {
			return '';
		}
	}

	// Condition translation helper
	function translateCondition(condition: string) {
		switch (condition) {
			case 'brand_new_with_tags': return m.sell_condition_brandNewWithTags();
			case 'new_without_tags': return m.sell_condition_newWithoutTags();
			case 'like_new': return m.sell_condition_likeNew();
			case 'good': return m.sell_condition_good();
			case 'worn': return m.sell_condition_worn();
			case 'fair': return m.sell_condition_fair();
			default: return condition.replaceAll('_', ' ');
		}
	}
</script>

<ErrorBoundary name="ProductPageSEO">
	<!-- SEO Meta -->
	<SEOMetaTags
		title={seoTitle}
		description={seoDescription}
		url={canonicalUrl}
		image={data.product.images?.[0]}
		type="product"
		product={data.product}
		seller={data.product.seller}
		canonical={`https://driplo.xyz${canonicalUrl}`}
		enableImageOptimization={true}
	/>
</ErrorBoundary>

<ErrorBoundary name="ProductPageContent">

<!-- Simple breadcrumb for legacy route -->
<ProductBreadcrumb
	category={data.product.category_name ? {
		id: data.product.category_id || '',
		name: data.product.category_name,
		slug: data.product.category_slug || ''
	} : null}
	seller={{
		username: data.product.seller_username,
		full_name: data.product.seller_name
	}}
	productTitle={data.product.title}
	variant="flat"
/>

<!-- Main Layout: Gallery + Info/Actions -->
<div class="mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8 pb-24 md:pb-0">
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
		<!-- Gallery -->
		<section>
			<ProductGallery
				images={data.product.images || []}
				title={data.product.title || ''}
				isSold={data.product.is_sold || false}
				condition={data.product.condition}
			/>

			<!-- Mobile unified post -->
			<div class="md:hidden mt-4 space-y-3">
				<div class="bg-white rounded-xl border border-gray-200 p-4">
					<!-- Header: avatar · name/@username · like -->
					<div class="flex items-center justify-between gap-4">
						<div class="flex items-center gap-3 min-w-0">
							{#if data.product.seller_avatar}
								<img src={data.product.seller_avatar} alt={data.product.seller_name || 'Seller avatar'} class="size-7 rounded-full object-cover" />
							{:else}
								<div class="size-7 rounded-full bg-[color:var(--gray-200)]" aria-hidden="true"></div>
							{/if}
							<div class="min-w-0">
								<a href={`/profile/${data.product.seller_id}`} class="block text-sm font-medium text-gray-900 truncate">{data.product.seller_name}</a>
								<div class="flex items-center gap-1.5 text-xs text-gray-500 truncate">
									{#if data.product.seller_username}
										<span class="truncate">@{data.product.seller_username}</span>
									{/if}
								</div>
							</div>
						</div>
						<div class="flex items-center gap-2 shrink-0">
							<button
								type="button"
								class={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${isLiked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-700'}`}
								aria-pressed={isLiked}
								onclick={async () => { const r = await handleFavorite(); return r; }}
							>
								<Heart class={`size-4 ${isLiked ? 'text-rose-600 fill-rose-600' : 'text-gray-500'}`}/>
								<span>{favoriteCount || 0}</span>
							</button>
						</div>
					</div>

					<!-- Condition + Title -->
					<div class="mt-3 flex items-center gap-3">
						{#if data.product.condition}
							<span class="shrink-0">
								<ConditionBadge condition={data.product.condition} />
							</span>
						{/if}
						<h1 class="flex-1 text-lg font-semibold text-gray-900 leading-snug tracking-tight truncate">
							{data.product.title}
						</h1>
					</div>

					<!-- Description -->
					{#if data.product.description}
						<p class="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap {descExpanded ? '' : 'line-clamp-4'}">
							{data.product.description}
						</p>
						{#if data.product.description.length > 160}
							<button
								type="button"
								class="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
								onclick={() => descExpanded = !descExpanded}
							>{descExpanded ? m.pdp_showLess() : m.pdp_readMore()}</button>
						{/if}
					{/if}
				</div>
			</div>

			<SellerCard
				id={data.product.seller_id}
				name={data.product.seller_name}
				avatar={data.product.seller_avatar}
				stats={{
					rating: data.product.seller_rating || 0,
					totalSales: data.product.seller_sales_count || 0,
					responseTime: 24,
					joinedDate: data.product.seller?.created_at || ''
				}}
				onMessage={handleMessage}
				onViewProfile={() => handleNavigate(`/profile/${data.product.seller_id}`)}
				class="md:hidden mt-4"
			/>
		</section>

		<!-- Info + Actions -->
		<section class="vr-md">
			<!-- Product Info -->
			<div class="space-y-4">
				<!-- Main Product Information Card -->
				<article class="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm" aria-label="Product information">
					<div class="p-4 sm:p-6">
						<!-- Brand -->
						{#if data.product.brand}
							<div class="mb-1">
								<span class="text-xs text-gray-500 uppercase tracking-wide">{data.product.brand}</span>
							</div>
						{/if}

						<!-- Title -->
						<h1 class="text-xl font-semibold text-gray-900 leading-tight">
							{data.product.title}
						</h1>

						<!-- Price Section -->
						<div class="mt-5 pb-5 border-b border-[color:var(--gray-100)]">
							<div class="flex items-baseline gap-3">
								<span class="text-3xl font-bold text-gray-900 tracking-tight" aria-label="Price">€{data.product.price}</span>
							</div>
						</div>

						<!-- Product Attributes -->
						<div class="flex flex-wrap gap-2.5 mt-5" role="list" aria-label="Product attributes">
							{#if data.product.size}
								<span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200" role="listitem">
									Size {data.product.size}
								</span>
							{/if}
							{#if data.product.condition}
								<span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200" role="listitem">
									{translateCondition(data.product.condition || '')}
								</span>
							{/if}
						</div>
					</div>
				</article>

				<!-- Description -->
				{#if data.product.description}
					<div class="hidden md:block bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
						<h2 class="text-base font-semibold text-gray-900 mb-3">{m.pdp_description()}</h2>
						<p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap {descExpanded ? '' : 'line-clamp-3'}">
							{data.product.description}
						</p>
						{#if data.product.description.length > 150}
							<button
								type="button"
								class="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700"
								onclick={() => descExpanded = !descExpanded}
							>
								{descExpanded ? m.pdp_showLess() : m.pdp_readMore()}
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Desktop actions -->
			<div class="mt-6">
				<ProductActions
					className="hidden md:flex"
					price={data.product.price}
					currency="€"
					isOwner={data.isOwner}
					isSold={data.product.is_sold}
					onBuyNow={handleBuyNow}
					onMessage={handleMessage}
					onMakeOffer={handleMakeOffer}
					showSellerInfo={false}
				/>
			</div>
		</section>
	</div>

	<!-- Below-the-fold lazy content sentinel -->
	{#if hasSimilar || hasSeller}
		<div bind:this={sentinel} class="h-px"></div>
	{/if}

	{#if showSimilar}
		<section class="mt-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">{m.pdp_youMayAlsoLike()}</h2>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{#each data.similarProducts as p (p.id)}
					<ProductCard
						product={{
							...p,
							currency: 'EUR'
						}}
						class="h-full"
					/>
				{/each}
			</div>
		</section>
	{/if}

	{#if showSeller}
		<section class="mt-6">
			<h2 class="text-xl font-semibold text-gray-900 mb-4">{m.pdp_moreFromSeller()}</h2>
			<div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
				{#each data.sellerProducts as p (p.id)}
					<ProductCard
						product={{
							...p,
							currency: 'EUR'
						}}
						class="h-full"
					/>
				{/each}
			</div>
		</section>
	{/if}
	</div>
	</ErrorBoundary>

<!-- Mobile sticky actions bar -->
<div class="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-gray-200 md:hidden" style="padding: 0; padding-bottom: max(1rem, env(safe-area-inset-bottom));">
	<div class="relative">
		<ProductActions
			price={data.product.price}
			currency="€"
			isOwner={data.isOwner}
			isSold={data.product.is_sold}
			onBuyNow={handleBuyNow}
			onMessage={handleMessage}
			onMakeOffer={handleMakeOffer}
			seller={{
				username: data.product.seller_username,
				avatar_url: data.product.images?.[0],
				rating: data.product.seller?.rating,
				full_name: data.product.seller_name
			}}
			productTitle={data.product.title}
			productDescription={data.product.description}
			showSellerInfo={true}
		/>
		<div class="absolute right-3 top-2 flex items-center gap-1 text-[11px] text-gray-500">
			<Clock class="size-3.5 text-gray-400" aria-hidden="true" />
			<span>{formatRelativeDate(data.product.created_at)}</span>
		</div>
	</div>
</div>

<style>
	/* Add bottom padding for mobile sticky nav */
	.vr-md {
		padding-bottom: 100px;
	}

	@media (min-width: 768px) {
		.vr-md {
			padding-bottom: 0;
		}
	}
</style>