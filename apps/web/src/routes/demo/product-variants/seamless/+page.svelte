<script lang="ts">
  import { ProductGallery, ProductActions, ConditionBadge } from '@repo/ui';

  const product = {
    title: 'Vintage Nike Crewneck Sweatshirt',
    brand: 'Nike',
    condition: 'VERY_GOOD',
    price: 59,
    images: [
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1080&auto=format&fit=crop'
    ],
    description:
      'Cozy vintage Nike crewneck in heather gray. Minimal wear, soft interior fleece. Fits oversized. Model 183cm. DM for sizing questions.'
  };

  function onBuyNow() {}
  function onMessage() {}
  function onMakeOffer() {}
</script>

<div class="mx-auto max-w-screen-sm px-4 pb-24 md:pb-0">
  <!-- Seamless: no borders, clean spacing, soft dividers only where needed -->
  <section>
    <ProductGallery images={product.images} title={product.title} condition={product.condition as any} />
  </section>

  <section class="mt-4 space-y-2">
    <h1 class="text-xl font-semibold leading-snug tracking-tight">{product.title}</h1>
    <div>
      <ConditionBadge condition={product.condition as any} />
    </div>
    <p class="text-[0.95rem] leading-relaxed text-[color:var(--gray-800)]">
      {product.description}
    </p>

    <dl class="mt-2 text-sm">
      <div class="flex justify-between py-1.5">
        <dt class="text-[color:var(--gray-600)]">Brand</dt>
        <dd class="font-medium">{product.brand}</dd>
      </div>
      <div class="border-t border-[color:var(--gray-200)] my-2"></div>
      <div class="flex justify-between py-1.5">
        <dt class="text-[color:var(--gray-600)]">Condition</dt>
        <dd class="font-medium">Very good</dd>
      </div>
    </dl>
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

