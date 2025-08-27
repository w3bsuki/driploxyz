# 🛍️ Direct Sales + Bundle Implementation Plan

*Implementing Depop-style direct sales with Vinted-style same-seller bundling*

## 📋 **Executive Summary**

**Model**: Direct purchase with optional same-seller bundling
**Goal**: Allow buyers to bundle items from same seller in one transaction
**Benefit**: One shipping fee, better seller earnings, improved UX

## 🎯 **Core Concept**

```
Single Item Flow:
Product → Buy Now → Checkout → Payment → Order

Bundle Flow:
Product → Buy Now → "Add more from seller?" → Select items → Checkout → Payment → Order
```

## 🗂️ **Database Schema Changes**

### 1. Create order_items table
```sql
CREATE TABLE public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id),
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    size VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, product_id)
);

-- Index for faster queries
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
```

### 2. Modify orders table
```sql
-- Remove product_id from orders (now in order_items)
ALTER TABLE public.orders 
DROP COLUMN product_id;

-- Add bundle-specific fields
ALTER TABLE public.orders 
ADD COLUMN items_count INTEGER DEFAULT 1,
ADD COLUMN bundle_discount DECIMAL(8,2) DEFAULT 0;
```

### 3. Add bundle tracking
```sql
CREATE TABLE public.bundle_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID NOT NULL REFERENCES public.profiles(id),
    seller_id UUID NOT NULL REFERENCES public.profiles(id),
    product_ids UUID[] NOT NULL,
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '30 minutes'),
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🎨 **UI/UX Flow**

### Product Page Changes
```svelte
<!-- Add to product page -->
<script>
  let bundleMode = $state(false);
  let selectedItems = $state([currentProduct]);
  
  function initiateBuy() {
    // Check if seller has other available items
    if (sellerAvailableItems > 1) {
      bundleMode = true;
      showBundleModal();
    } else {
      goToCheckout([currentProduct]);
    }
  }
</script>

<Button onclick={initiateBuy}>
  Buy Now
</Button>

{#if bundleMode}
  <BundleBuilder
    {sellerId}
    {selectedItems}
    onConfirm={(items) => goToCheckout(items)}
  />
{/if}
```

### New BundleBuilder Component
```svelte
<!-- packages/ui/src/lib/BundleBuilder.svelte -->
<script lang="ts">
  interface Props {
    sellerId: string;
    initialItem: Product;
    onConfirm: (items: Product[]) => void;
  }
  
  let { sellerId, initialItem, onConfirm }: Props = $props();
  let selectedItems = $state([initialItem]);
  let sellerProducts = $state([]);
  
  // Fetch seller's other available products
  onMount(async () => {
    sellerProducts = await fetchSellerProducts(sellerId);
  });
  
  const totalPrice = $derived(
    selectedItems.reduce((sum, item) => sum + item.price, 0)
  );
  
  const savings = $derived(
    selectedItems.length > 1 ? (selectedItems.length - 1) * 5 : 0 // Save €5 per additional item (shipping)
  );
</script>

<div class="bundle-modal">
  <h2>🛍️ Bundle & Save on Shipping!</h2>
  <p>Add more from @{sellerUsername} - one shipping fee for all items</p>
  
  <div class="selected-items">
    <h3>Your Bundle ({selectedItems.length} items)</h3>
    {#each selectedItems as item}
      <BundleItem {item} onRemove={() => removeItem(item)} />
    {/each}
  </div>
  
  <div class="available-items">
    <h3>More from this seller</h3>
    {#each sellerProducts as product}
      {#if !selectedItems.includes(product)}
        <ProductCard
          {product}
          showAddButton
          onAdd={() => selectedItems.push(product)}
        />
      {/if}
    {/each}
  </div>
  
  <div class="bundle-summary">
    <div>Total: €{totalPrice}</div>
    <div class="savings">You save €{savings} on shipping!</div>
    <Button onclick={() => onConfirm(selectedItems)}>
      Checkout Bundle (€{totalPrice + 5})
    </Button>
  </div>
</div>
```

## 🔄 **API Changes**

### 1. Update Checkout API
```typescript
// /api/checkout/+server.ts
export const POST: RequestHandler = async ({ request, locals }) => {
  const { items, bundleSessionId } = await request.json();
  
  // Validate all items are from same seller
  const sellerIds = [...new Set(items.map(i => i.seller_id))];
  if (sellerIds.length > 1) {
    return error(400, 'All items must be from the same seller');
  }
  
  // Calculate bundle pricing
  const itemsTotal = items.reduce((sum, item) => sum + item.price, 0);
  const shippingCost = 500; // €5 once for bundle
  const serviceFee = Math.round(itemsTotal * 0.05) + 70;
  const totalAmount = itemsTotal + shippingCost + serviceFee;
  
  // Create payment intent with metadata for all items
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount,
    currency: 'eur',
    metadata: {
      bundleSessionId,
      itemCount: items.length,
      itemIds: items.map(i => i.id).join(','),
      sellerId: sellerIds[0],
      buyerId: session.user.id
    }
  });
  
  return json({
    clientSecret: paymentIntent.client_secret,
    bundleDetails: {
      items,
      itemsTotal: itemsTotal / 100,
      shippingCost: shippingCost / 100,
      serviceFee: serviceFee / 100,
      totalAmount: totalAmount / 100
    }
  });
};
```

### 2. Create Bundle Session API
```typescript
// /api/bundles/session/+server.ts
export const POST: RequestHandler = async ({ request, locals }) => {
  const { sellerId, productIds } = await request.json();
  
  // Create temporary bundle session
  const { data: session } = await supabase
    .from('bundle_sessions')
    .insert({
      buyer_id: locals.user.id,
      seller_id: sellerId,
      product_ids: productIds,
      expires_at: new Date(Date.now() + 30 * 60000) // 30 minutes
    })
    .select()
    .single();
  
  return json({ sessionId: session.id });
};
```

### 3. Update Order Confirmation
```typescript
// /api/checkout/confirm/+server.ts
export const POST: RequestHandler = async ({ request, locals }) => {
  const { paymentIntentId } = await request.json();
  
  // Retrieve payment intent
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  
  if (paymentIntent.status !== 'succeeded') {
    return error(400, 'Payment not completed');
  }
  
  // Parse metadata to get items
  const itemIds = paymentIntent.metadata.itemIds.split(',');
  
  // Create order
  const { data: order } = await supabase
    .from('orders')
    .insert({
      buyer_id: paymentIntent.metadata.buyerId,
      seller_id: paymentIntent.metadata.sellerId,
      status: 'paid',
      total_amount: paymentIntent.amount / 100,
      shipping_cost: 5,
      items_count: itemIds.length,
      payment_intent_id: paymentIntentId
    })
    .select()
    .single();
  
  // Create order items
  const orderItems = await Promise.all(
    itemIds.map(async (productId) => {
      const { data: product } = await supabase
        .from('products')
        .select('price')
        .eq('id', productId)
        .single();
      
      return {
        order_id: order.id,
        product_id: productId,
        price: product.price
      };
    })
  );
  
  await supabase
    .from('order_items')
    .insert(orderItems);
  
  // Mark products as sold
  await supabase
    .from('products')
    .update({ 
      is_sold: true,
      sold_at: new Date().toISOString()
    })
    .in('id', itemIds);
  
  return json({ 
    success: true, 
    orderId: order.id,
    itemCount: itemIds.length
  });
};
```

## 📱 **Mobile Optimization**

### Bundle Builder Mobile View
```css
/* Mobile-first bundle builder */
.bundle-builder {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 70vh;
  background: white;
  border-radius: 20px 20px 0 0;
  animation: slideUp 0.3s ease;
}

.bundle-items-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 16px;
}

.bundle-summary {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

@media (min-width: 768px) {
  .bundle-builder {
    position: relative;
    height: auto;
    max-width: 600px;
    margin: 0 auto;
  }
  
  .bundle-items-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## 🔄 **Order Management Updates**

### Display Bundle Orders
```svelte
<!-- Update order-management page -->
{#each order.items as item}
  <div class="order-item">
    <img src={item.product.image} alt={item.product.title} />
    <div>
      <h4>{item.product.title}</h4>
      <p>€{item.price}</p>
    </div>
  </div>
{/each}

{#if order.items_count > 1}
  <div class="bundle-badge">
    📦 Bundle: {order.items_count} items
  </div>
{/if}
```

## ⚡ **Implementation Steps**

### Phase 1: Database (Day 1)
1. [ ] Create migration for order_items table
2. [ ] Update orders table structure  
3. [ ] Add bundle_sessions table
4. [ ] Update RLS policies
5. [ ] Regenerate TypeScript types

### Phase 2: API (Day 2)
1. [ ] Update checkout API for multiple items
2. [ ] Create bundle session endpoints
3. [ ] Modify order confirmation flow
4. [ ] Update order fetching to include items

### Phase 3: UI Components (Day 3-4)
1. [ ] Create BundleBuilder component
2. [ ] Update product page with bundle option
3. [ ] Modify checkout page for bundles
4. [ ] Update order management display

### Phase 4: Testing (Day 5)
1. [ ] Test single item purchase
2. [ ] Test bundle creation
3. [ ] Test payment processing
4. [ ] Test order management
5. [ ] Mobile testing

## 🐛 **Edge Cases to Handle**

1. **Stock Management**
   - Item sold while bundling
   - Seller deactivates during session
   
2. **Pricing**
   - Price changes during bundle session
   - Bundle session expiry
   
3. **Limits**
   - Max 10 items per bundle
   - Max weight for shipping
   
4. **Refunds**
   - Partial refund for bundle items
   - Dispute on single item in bundle

## 📊 **Success Metrics**

- **Bundle Rate**: % of orders with >1 item
- **Average Order Value**: Target +30% increase
- **Checkout Completion**: Maintain >60%
- **Seller Satisfaction**: Fewer shipments, more revenue

## ✅ **Definition of Done**

- [ ] Users can buy single items directly
- [ ] Users can add more items from same seller
- [ ] Single payment for bundle
- [ ] One shipping fee for bundle
- [ ] Order management shows all items
- [ ] Mobile-optimized bundle builder
- [ ] 0 TypeScript errors
- [ ] Tested on 375px viewport

---

*This implementation brings the best of both worlds: Depop's simplicity + smart bundling*