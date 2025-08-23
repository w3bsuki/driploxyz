<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto px-4 py-8">
  <h1 class="text-2xl font-bold mb-6">My Orders</h1>
  
  <div class="space-y-8">
    {#if data.buyerOrders?.length > 0}
      <section>
        <h2 class="text-xl font-semibold mb-4">Purchases</h2>
        <div class="grid gap-4">
          {#each data.buyerOrders as order}
            <div class="border rounded-lg p-4">
              <div class="flex justify-between">
                <div>
                  <h3 class="font-medium">{order.product?.title || 'Product'}</h3>
                  <p class="text-sm text-gray-600">Seller: {order.seller?.username || 'Unknown'}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium">${order.total_amount}</p>
                  <p class="text-sm text-gray-600">{order.status}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if data.sellerOrders?.length > 0}
      <section>
        <h2 class="text-xl font-semibold mb-4">Sales</h2>
        <div class="grid gap-4">
          {#each data.sellerOrders as order}
            <div class="border rounded-lg p-4">
              <div class="flex justify-between">
                <div>
                  <h3 class="font-medium">{order.product?.title || 'Product'}</h3>
                  <p class="text-sm text-gray-600">Buyer: {order.buyer?.username || 'Unknown'}</p>
                </div>
                <div class="text-right">
                  <p class="font-medium">${order.total_amount}</p>
                  <p class="text-sm text-gray-600">{order.status}</p>
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

    {#if (!data.buyerOrders || data.buyerOrders.length === 0) && (!data.sellerOrders || data.sellerOrders.length === 0)}
      <p class="text-gray-600">No orders yet.</p>
    {/if}
  </div>
</div>