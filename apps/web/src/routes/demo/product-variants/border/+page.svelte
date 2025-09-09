<script lang="ts">
  import { ProductGallery, ProductActions, ConditionBadge, SellerCard } from '@repo/ui';

  const product = {
    title: 'Levi’s 501 Raw Denim Jeans',
    brand: 'Levi’s',
    condition: 'LIKE_NEW',
    price: 79,
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1080&auto=format&fit=crop'
    ],
    description: 'Classic 501 raw denim, tapered fit. Lightly worn, no fades yet. Hemmed to 30”.'
  };

  const seller = {
    id: 'demo',
    name: 'Ivaylo Hristov',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=256&auto=format&fit=crop',
    rating: 4.9,
    sales: 128,
    joined: '2023-01-05T00:00:00Z'
  };

  function onBuyNow() {}
  function onMessage() {}
  function onMakeOffer() {}
</script>

<div class="mx-auto max-w-screen-sm px-4 pb-24 md:pb-0">
  <!-- App feel: clear cards and hierarchy -->
  <section>
    <ProductGallery images={product.images} title={product.title} condition={product.condition as any} />
  </section>

  <section class="mt-3 space-y-3">
    <article class="bg-white border border-[color:var(--gray-200)] rounded-xl p-4 shadow-sm">
      <h1 class="text-xl font-semibold leading-snug tracking-tight">{product.title}</h1>
      <div class="mt-1"><ConditionBadge condition={product.condition as any} /></div>
      <p class="mt-2 text-[0.95rem] text-[color:var(--gray-800)] leading-relaxed">{product.description}</p>
    </article>

    <article class="bg-white border border-[color:var(--gray-200)] rounded-xl">
      <div class="px-4 py-2 border-b border-[color:var(--gray-200)] text-sm font-semibold">Details</div>
      <dl>
        <div class="px-4 py-2 flex justify-between text-sm border-b border-[color:var(--gray-100)]"><dt class="text-[color:var(--gray-600)]">Brand</dt><dd class="font-medium text-[color:var(--gray-900)]">{product.brand}</dd></div>
        <div class="px-4 py-2 flex justify-between text-sm"><dt class="text-[color:var(--gray-600)]">Condition</dt><dd class="font-medium text-[color:var(--gray-900)]">Like new</dd></div>
      </dl>
    </article>

    <SellerCard
      id={seller.id}
      name={seller.name}
      avatar={seller.avatar}
      stats={{ rating: seller.rating, totalSales: seller.sales, responseTime: 24, joinedDate: seller.joined }}
      onMessage={onMessage}
      onViewProfile={() => {}}
    />
  </section>
</div>

<!-- Sticky action bar (mobile) -->
<div class="fixed bottom-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-md border-t border-[color:var(--gray-200)] md:hidden" style="padding: 0; padding-bottom: max(1rem, env(safe-area-inset-bottom));">
  <div class="mx-auto max-w-screen-sm px-3 py-2">
    <div class="flex items-center gap-3">
      <img src={product.images[0]} alt={product.title} class="size-10 rounded-md object-cover border border-[color:var(--gray-200)]" />
      <div class="min-w-0 flex-1">
        <p class="text-xs text-[color:var(--gray-700)] leading-snug line-clamp-1">{product.title}</p>
      </div>
      <ProductActions
        className="flex-shrink-0"
        price={product.price}
        currency={'€'}
        onBuyNow={onBuyNow}
        onMessage={onMessage}
        onMakeOffer={onMakeOffer}
      />
    </div>
  </div>
</div>

