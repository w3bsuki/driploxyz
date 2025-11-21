<script lang="ts">
  import { goto } from '$app/navigation';
  import { ProductBreadcrumb, SEOMetaTags, ProductGallery, ProductCard, ConditionBadge, ProductActions, SellerCard } from '@repo/ui';
  import { mapProduct } from '$lib/types/domain';
  import { Heart, Clock } from '@lucide/svelte';
  import { buildProductUrl } from '$lib/utils/seo-urls';
  import type { PageData } from './$types';
  import * as m from '@repo/i18n';

  let { data }: { data: PageData } = $props();

  // Safe access helpers (no `any`):
  function pickString(obj: unknown, key: string): string | undefined {
    if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
      const v = (obj as Record<string, unknown>)[key];
      return typeof v === 'string' ? v : undefined;
    }
    return undefined;
  }
  function pickNumber(obj: unknown, key: string): number | undefined {
    if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
      const v = (obj as Record<string, unknown>)[key];
      return typeof v === 'number' ? v : undefined;
    }
    return undefined;
  }
  function pickBoolean(obj: unknown, key: string): boolean | undefined {
    if (obj && typeof obj === 'object' && key in (obj as Record<string, unknown>)) {
      const v = (obj as Record<string, unknown>)[key];
      return typeof v === 'boolean' ? v : undefined;
    }
    return undefined;
  }

  // Canonical URL
  const canonicalUrl = buildProductUrl({
    id: data.product.id,
    slug: data.product.slug!,
    seller_username: data.product.seller_username!,
    category_slug: data.product.category_slug
  });

  // State (simplified)
  // Ensure boolean state even if server streamed this as a Promise<boolean>
  const initialLiked = (() => {
    const v = pickBoolean(data, 'isFavorited');
    return Boolean(v);
  })();
  let isLiked = $state(initialLiked);
  let favoriteCount = $state<number>(pickNumber(data.product, 'favorite_count') ?? 0);
  let descExpanded = $state(false);
  // Lazy sections control
  // These are streamed as Promises; defer length checks to the await blocks
  const hasSimilar = true;
  const hasSeller = true;
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
  const productBrand = pickString(data.product, 'brand');
  const productSize = pickString(data.product, 'size');
  const productCondition = pickString(data.product, 'condition');
  // Additional optional fields can be read similarly via pickString if needed

  const seoTitle = [
    productBrand,
    data.product.title,
    productSize && `Size ${productSize}`,
    productCondition
  ].filter(Boolean).join(' · ');
  
  const seoDescription = [
    data.product.description || `${data.product.title} by ${data.product.seller_name}`,
    productBrand && `Brand: ${productBrand}`,
    productSize && `Size: ${productSize}`,
    productCondition && `Condition: ${productCondition}`,
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

<!-- SEO Meta -->
<SEOMetaTags
  title={seoTitle}
  description={seoDescription}
  url={canonicalUrl}
  image={data.product.images?.[0]}
  type="product"
  product={data.product as any}
  seller={(data.product as any).seller}
  canonical={`https://driplo.xyz${canonicalUrl}`}
  preloadImages={data.product.images?.slice(0, 2) || []}
  enableImageOptimization={true}
/>

<!-- Breadcrumb -->
  <ProductBreadcrumb
  category={{
    id: data.product.category_id || '',
  name: (data.product as any)?.categories?.name || 'Unknown',
    slug: data.product.category_slug || ''
  }}
  parentCategory={data.product.parent_category ? {
    id: data.product.parent_category.id,
    name: data.product.parent_category.name,
    slug: data.product.parent_category.slug
  } : null}
  topLevelCategory={data.product.top_level_category ? {
    id: data.product.top_level_category.id,
    name: data.product.top_level_category.name,
    slug: data.product.top_level_category.slug
  } : null}
  seller={{
    username: data.product.seller_username,
    full_name: data.product.seller_name
  }}
  productTitle={data.product.title}
  variant="default"
/>

<!-- Main Layout: Gallery + Info/Actions -->
<div class="mx-auto max-w-screen-xl px-4 md:px-6 lg:px-8 pb-24 md:pb-0">
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
    <!-- Gallery -->
    <section>
      <ProductGallery
        images={data.product.images || []}
        title={data.product.title || ''}
  isSold={Boolean(pickBoolean(data.product, 'is_sold'))}
  condition={productCondition as any}
      />

      <!-- Mobile unified post: condition · header (avatar/name/@username · like) · title · description -->
      <div class="md:hidden mt-4 space-y-3">
        <div class="bg-white rounded-xl border border-gray-200 p-4">
          <!-- Header: avatar · name/@username · like (date moved under name) -->
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
                    {#if (data.product as any).location}<span aria-hidden="true">·</span>{/if}
                  {/if}
                  {#if (data.product as any).location}
                    <span class="truncate">{(data.product as any).location}</span>
                  {/if}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                class={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${isLiked ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-gray-200 bg-white text-gray-700'}`}
                aria-pressed={Boolean(isLiked)}
                onclick={async () => { const r = await handleFavorite(); return r; }}
              >
                <Heart class={`size-4 ${isLiked ? 'text-rose-600 fill-rose-600' : 'text-gray-500'}`}/>
                <span>{favoriteCount || 0}</span>
              </button>
            </div>
          </div>

          <!-- Condition + Title (inline, condition on the left) -->
          <div class="mt-3 flex items-center gap-3">
            {#if (data.product as any).condition}
              <span class="shrink-0">
                <ConditionBadge condition={(data.product as any).condition} />
              </span>
            {/if}
            <h1 class="flex-1 text-lg font-semibold text-gray-900 leading-snug tracking-tight truncate">
              {data.product.title}
            </h1>
          </div>

          <!-- Description -->
          {#if (data.product as any).description}
            <p class="mt-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap {descExpanded ? '' : 'line-clamp-4'}">
              {(data.product as any).description}
            </p>
            {#if ((data.product as any).description as string).length > 160}
              <button
                type="button"
                class="mt-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                onclick={() => descExpanded = !descExpanded}
              >{descExpanded ? m.pdp_showLess() : m.pdp_readMore()}</button>
            {/if}
          {/if}
        </div>

        <!-- Quick facts table (mobile) -->
        <div class="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div class="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-900">{m.pdp_details()}</h3>
          </div>
          <dl class="divide-y divide-[color:var(--gray-100)]">
            {#if (data.product as any).brand}
              <div class="px-4 py-3 grid grid-cols-[auto_1fr] items-center gap-4 text-sm">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-600 whitespace-nowrap">{m.pdp_brand()}</dt>
                <dd class="font-semibold text-gray-900 text-right truncate">{(data.product as any).brand}</dd>
              </div>
            {/if}
            {#if (data.product as any).size}
              <div class="px-4 py-3 grid grid-cols-[auto_1fr] items-center gap-4 text-sm">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-600 whitespace-nowrap">{m.pdp_size()}</dt>
                <dd class="font-semibold text-gray-900 text-right truncate">{(data.product as any).size}</dd>
              </div>
            {/if}
            {#if (data.product as any).condition}
              <div class="px-4 py-3 grid grid-cols-[auto_1fr] items-center gap-4 text-sm">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-600 whitespace-nowrap">{m.pdp_condition()}</dt>
                <dd class="font-semibold text-gray-900 text-right truncate">{translateCondition(((data.product as any).condition || '') as string)}</dd>
              </div>
            {/if}
            {#if (data.product as any).color}
              <div class="px-4 py-3 grid grid-cols-[auto_1fr] items-center gap-4 text-sm">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-600 whitespace-nowrap">{m.pdp_color()}</dt>
                <dd class="font-semibold text-gray-900 text-right truncate">{(data.product as any).color}</dd>
              </div>
            {/if}
            {#if (data.product as any).material}
              <div class="px-4 py-3 grid grid-cols-[auto_1fr] items-center gap-4 text-sm">
                <dt class="text-xs font-medium uppercase tracking-wide text-gray-600 whitespace-nowrap">{m.pdp_material()}</dt>
                <dd class="font-semibold text-gray-900 text-right truncate">{(data.product as any).material}</dd>
              </div>
            {/if}
          </dl>
        </div>
      </div>
    <SellerCard
      id={data.product.seller_id}
      name={data.product.seller_name || ''}
      avatar={(data.product.seller_avatar ?? undefined) as string | undefined}
      stats={{
        rating: data.product.seller_rating || 0,
        totalSales: data.product.seller_sales_count || 0,
        responseTime: 24,
        joinedDate: (data.product as any).seller?.created_at || ''
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

            <!-- Brand (tiny) -->
            {#if (data.product as any).brand}
              <div class="mb-1">
                <span class="text-xs text-gray-500 uppercase tracking-wide">{(data.product as any).brand}</span>
              </div>
            {/if}

            <!-- Title -->
            <h1 class="text-xl font-semibold text-gray-900 leading-tight">
              {data.product.title}
            </h1>

            <!-- Price Section -->
            <div class="mt-5 pb-5 border-b border-[color:var(--gray-100)]">
              <div class="flex items-baseline gap-3">
                <span class="text-3xl font-bold text-gray-900 tracking-tight" aria-label="Price" data-testid="product-price">€{Number((data.product as any).price)}</span>
                {#if (data.product as any).original_price && (data.product as any).original_price > (data.product as any).price}
                  <span class="text-lg text-gray-500 line-through" aria-label="Original price">€{(data.product as any).original_price}</span>
                  <span class="sr-only">Reduced from €{(data.product as any).original_price} to €{(data.product as any).price}</span>
                {/if}
              </div>
            </div>

            <!-- Product Attributes -->
            <div class="flex flex-wrap gap-2.5 mt-5" role="list" aria-label="Product attributes">
              {#if (data.product as any).size}
                <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-50 text-zinc-900 border border-zinc-200" role="listitem">
                  Size {(data.product as any).size}
                </span>
              {/if}
              {#if (data.product as any).color}
                <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200" role="listitem">
                  {(data.product as any).color}
                </span>
              {/if}
              {#if (data.product as any).material}
                <span class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-zinc-50 text-zinc-900 border border-zinc-200" role="listitem">
                  {(data.product as any).material}
                </span>
              {/if}
            </div>

          </div>
        </article>

        <!-- Description -->
        {#if (data.product as any).description}
          <div class="hidden md:block bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h2 class="text-base font-semibold text-gray-900 mb-3">{m.pdp_description()}</h2>
            <p class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap {descExpanded ? '' : 'line-clamp-3'}">
              {(data.product as any).description}
            </p>
            {#if ((data.product as any).description as string).length > 150}
              <button 
                type="button" 
                class="mt-2 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                onclick={() => descExpanded = !descExpanded}
              >
                {descExpanded ? m.pdp_showLess() : m.pdp_readMore()}
              </button>
            {/if}
          </div>
        {/if}

        <!-- Product Details Table -->
        <section class="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm" aria-labelledby="details-heading">
          <div class="px-5 py-3.5 bg-gray-50 border-b border-gray-200">
            <h2 id="details-heading" class="text-base font-semibold text-gray-900">{m.pdp_productDetails()}</h2>
          </div>
          {#snippet fact(label: string, value: string)}
            <div class="px-5 py-3.5 border-b border-[color:var(--gray-100)] last:border-b-0">
              <div class="grid grid-cols-[auto_1fr] items-center gap-4">
                <dt class="text-sm font-medium text-gray-600 whitespace-nowrap">{label}</dt>
                <dd class="text-sm text-gray-900 font-semibold text-right truncate">{value}</dd>
              </div>
            </div>
          {/snippet}
          <dl role="list" aria-label="Product specifications">
            {#if (data.product as any).brand}{@render fact(m.pdp_brand(), (data.product as any).brand)}{/if}
            {#if (data.product as any).size}{@render fact(m.pdp_size(), (data.product as any).size)}{/if}
            {#if (data.product as any).condition}{@render fact(m.pdp_condition(), translateCondition((data.product as any).condition || ''))}{/if}
            {#if (data.product as any).color}{@render fact(m.pdp_color(), (data.product as any).color)}{/if}
            {#if (data.product as any).material}{@render fact(m.pdp_material(), (data.product as any).material)}{/if}
            {#if data.product.category_name}{@render fact(m.pdp_category(), data.product.category_name)}{/if}
          </dl>
        </section>
      </div>

      <!-- Desktop actions -->
      <div class="mt-6">
        <ProductActions
          className="hidden md:flex"
          price={Number((data.product as any).price)}
          currency="€"
          isOwner={Boolean(data.isOwner)}
          isSold={Boolean((data.product as any).is_sold)}
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
        {#await data.similarProducts then similar}
          {#if Array.isArray(similar) && similar.length > 0}
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {#each similar as p (p.id)}
                {@const product = mapProduct(p as Record<string, any>)}
                <ProductCard
                  {product}
                  class="h-full"
                  translations={{ currency: '€' }}
                />
              {/each}
            </div>
          {/if}
        {/await}
      </section>
    {/if}

    {#if showSeller}
      <section class="mt-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">{m.pdp_moreFromSeller()}</h2>
        {#await data.sellerProducts then sellerItems}
          {#if Array.isArray(sellerItems) && sellerItems.length > 0}
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {#each sellerItems as p (p.id)}
                {@const product = mapProduct(p as Record<string, any>)}
                <ProductCard
                  {product}
                  class="h-full"
                  translations={{ currency: '€' }}
                />
              {/each}
            </div>
          {/if}
        {/await}
      </section>
    {/if}
  </div>

<!-- Mobile sticky actions bar -->
<div class="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-gray-200 md:hidden" style="padding: 0; padding-bottom: max(1rem, env(safe-area-inset-bottom));">
  <div class="relative">
    <ProductActions
      price={Number((data.product as any).price)}
      currency="€"
  isOwner={Boolean(data.isOwner ?? false)}
  isSold={Boolean(pickBoolean(data.product, 'is_sold'))}
      onBuyNow={handleBuyNow}
      onMessage={handleMessage}
      onMakeOffer={handleMakeOffer}
      seller={{
        username: (data.product as any).seller_username,
        avatar_url: (data.product as any).images?.[0],
        rating: (data.product as any).seller_rating ?? (data.product as any).seller?.rating,
        full_name: (data.product as any).seller_name
      }}
      productTitle={(data.product as any).title}
      productDescription={(data.product as any).description}
      showSellerInfo={true}
    />
    <div class="absolute right-3 top-2 flex items-center gap-1 text-[11px] text-gray-500">
      <Clock class="size-3.5 text-gray-400" aria-hidden="true" />
  <span>{formatRelativeDate(((data.product as any).created_at ?? (data.product as any).createdAt) as string)}</span>
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





