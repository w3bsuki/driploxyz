<script lang="ts">
  import { Button } from '@repo/ui';
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';
  import { getProductUrl } from '$lib/utils/seo-urls';
  
  interface Props {
    data: PageData;
    form?: ActionData;
  }
  
  let { data, form }: Props = $props();
  
  let deleteModalOpen = $state(false);
  // let currentTag = $state('');
  let tags = $state(data.product.tags?.join(', ') || '');
  
  const mainCategories = $derived((data.categories as Array<{ id: string; name: string; slug: string; parent_id?: string | null }>).filter(c => !c.parent_id));
  const getSubcategories = (parentId: string) =>
    (data.categories as Array<{ id: string; name: string; slug: string; parent_id?: string | null }>).filter(c => c.parent_id === parentId);
  
  const selectedMainCategory = $derived(
    (data.categories as Array<{ id: string; name: string; slug: string; parent_id?: string | null }>).find(c => c.id === data.product.category_id)?.parent_id ||
    data.product.category_id
  );
  
  const subcategories = $derived(
    selectedMainCategory ? getSubcategories(selectedMainCategory) : []
  );
  
  const conditions = ['new', 'like-new', 'good', 'fair'] as const;
  
  const popularBrands = [
    'Nike', 'Adidas', 'Zara', 'H&M', 'Levi\'s', 'Gap', 'Uniqlo', 
    'Forever 21', 'Urban Outfitters', 'Mango', 'COS', 'Other'
  ];
  
  const sizes = {
    'clothing': ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    'shoes': ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12'],
    'kids': ['0-3M', '3-6M', '6-12M', '12-18M', '18-24M', '2T', '3T', '4T', '5', '6', '7', '8', '10', '12', '14']
  };
</script>

<svelte:head>
  <title>Edit {data.product.title} - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8">
    <!-- Page Header -->
    <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6 mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p class="text-sm text-gray-600 mt-1">Update your product listing details</p>
        </div>
        <a href={getProductUrl(data.product)} class="text-sm text-gray-600 hover:text-gray-900">
          View Product →
        </a>
      </div>
    </div>

    {#if form?.error}
      <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
        {form.error}
      </div>
    {/if}

    <!-- Edit Form -->
    <form method="POST" action="?/update" use:enhance class="space-y-6">
      <!-- Basic Details -->
      <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
        <h2 class="text-lg font-semibold mb-4">Basic Details</h2>
        
        <div class="space-y-4">
          <div>
            <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Title*</label>
            <input 
              id="title"
              name="title"
              type="text"
              value={data.product.title}
              required
              maxlength="255"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description*</label>
            <textarea 
              id="description"
              name="description"
              rows="4"
              required
              value={data.product.description}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            ></textarea>
          </div>
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="category_id" class="block text-sm font-medium text-gray-700 mb-1">Category*</label>
              <select 
                id="category_id"
                name="category_id"
                required
                value={data.product.category_id}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Select category</option>
                {#each mainCategories as cat}
                  <option value={cat.id}>{cat.name}</option>
                {/each}
                {#if subcategories.length > 0}
                  <optgroup label="Subcategories">
                    {#each subcategories as subcat}
                      <option value={subcat.id}>{subcat.name}</option>
                    {/each}
                  </optgroup>
                {/if}
              </select>
            </div>
            
            <div>
              <label for="condition" class="block text-sm font-medium text-gray-700 mb-1">Condition*</label>
              <select 
                id="condition"
                name="condition"
                required
                value={data.product.condition}
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {#each conditions as cond}
                  <option value={cond}>{cond.replace('-', ' ')}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Product Info -->
      <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
        <h2 class="text-lg font-semibold mb-4">Product Info</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="brand" class="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <input 
              id="brand"
              name="brand"
              type="text"
              value={data.product.brand || ''}
              list="brands"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <datalist id="brands">
              {#each popularBrands as brand}
                <option value={brand}></option>
              {/each}
            </datalist>
          </div>
          
          <div>
            <label for="size" class="block text-sm font-medium text-gray-700 mb-1">Size</label>
            <input 
              id="size"
              name="size"
              type="text"
              value={data.product.size || ''}
              list="sizes"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <datalist id="sizes">
              {#each sizes.clothing as s}
                <option value={s}></option>
              {/each}
            </datalist>
          </div>
          
          <div>
            <label for="color" class="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <input 
              id="color"
              name="color"
              type="text"
              value={data.product.color || ''}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          
          <div>
            <label for="material" class="block text-sm font-medium text-gray-700 mb-1">Material</label>
            <input 
              id="material"
              name="material"
              type="text"
              value={data.product.material || ''}
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="bg-white rounded-lg shadow-xs p-4 sm:p-6">
        <h2 class="text-lg font-semibold mb-4">Pricing</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="price" class="block text-sm font-medium text-gray-700 mb-1">Price*</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input 
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={data.product.price}
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label for="shipping_cost" class="block text-sm font-medium text-gray-700 mb-1">Shipping Cost</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input 
                id="shipping_cost"
                name="shipping_cost"
                type="number"
                step="0.01"
                min="0"
                value={data.product.shipping_cost || 0}
                class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <label for="tags" class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <input 
            id="tags"
            name="tags"
            type="text"
            bind:value={tags}
            placeholder="Comma-separated tags (e.g. vintage, streetwear, designer)"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
          <p class="text-xs text-gray-500 mt-1">Separate tags with commas</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onclick={() => deleteModalOpen = true}
          class="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
        >
          Delete Product
        </Button>
        
        <div class="flex space-x-3">
          <a href={getProductUrl(data.product)}>
            <Button variant="outline">Cancel</Button>
          </a>
          <Button type="submit">Save Changes</Button>
        </div>
      </div>
    </form>
  </div>
</div>

<!-- Delete Confirmation Modal -->
{#if deleteModalOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-lg max-w-md w-full p-6">
      <h3 class="text-lg font-semibold mb-2">Delete Product</h3>
      <p class="text-gray-600 mb-6">
        Are you sure you want to delete "{data.product.title}"? This action cannot be undone.
      </p>
      
      <form method="POST" action="?/delete" use:enhance>
        <div class="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onclick={() => deleteModalOpen = false}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            class="bg-red-600 hover:bg-red-700"
          >
            Delete Product
          </Button>
        </div>
      </form>
    </div>
  </div>
{/if}