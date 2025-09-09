<script lang="ts">
  import { ProductGallery, ProductActions, ConditionBadge } from '@repo/ui';

  const product = {
    title: 'Arc’teryx Beta LT Jacket',
    brand: 'Arc’teryx',
    condition: 'EXCELLENT',
    price: 299,
    images: [
      'https://images.unsplash.com/photo-1539533113208-f6df8cc8b543?q=80&w=1080&auto=format&fit=crop'
    ],
    description:
      'Technical shell with Gore‑Tex, minimal wear. StormHood, micro‑seam tape, WaterTight zips. Trail‑ready and city clean.'
  };

  function onBuyNow() {}
  function onMessage() {}
  function onMakeOffer() {}
</script>

<!-- Creative: hero overlay + floating meta -->
<div class="relative">
  <div class="absolute inset-x-0 top-0 h-[20vh] bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10"></div>
  <ProductGallery images={product.images} title={product.title} condition={product.condition as any} />
  <div class="absolute left-4 bottom-4 z-10 hidden sm:flex items-center gap-2">
    <ConditionBadge condition={product.condition as any} />
  </div>
</div>

<div class="mx-auto max-w-screen-sm px-4 pb-24 md:pb-0 mt-4">
  <header class="flex items-start gap-3">
    <div class="size-9 rounded-full bg-[color:var(--gray-200)]"></div>
    <div class="min-w-0 flex-1">
      <h1 class="text-xl font-semibold leading-snug tracking-tight">{product.title}</h1>
      <p class="text-xs text-[color:var(--gray-500)]">by @kush3 · Today</p>
    </div>
  </header>

  <article class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
    <div class="sm:col-span-2">
      <p class="text-[0.98rem] leading-relaxed text-[color:var(--gray-800)]">{product.description}</p>
    </div>
    <aside class="space-y-2">
      <div class="rounded-xl border border-[color:var(--gray-200)] p-3">
        <div class="text-sm text-[color:var(--gray-600)]">Brand</div>
        <div class="font-medium">{product.brand}</div>
      </div>
      <div class="rounded-xl border border-[color:var(--gray-200)] p-3">
        <div class="text-sm text-[color:var(--gray-600)]">Condition</div>
        <div class="font-medium">Excellent</div>
      </div>
    </aside>
  </article>
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

