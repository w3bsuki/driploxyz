<script lang="ts">
  import { Button, Badge, ProductCard, Modal, Input, Select, ConditionBadge, Avatar, Card } from '@repo/ui';
  import type { Product } from '@repo/database';
  
  let showModal = $state(false);
  let inputValue = $state('');
  let selectValue = $state('');
  let selectedHighlightVariant = $state(0);
  
  // Sample products for highlight cards demo
  const highlightProducts = [
    {
      title: 'Vintage Nike Hoodie',
      price: 45,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
      seller: 'JohnDoe',
      sellerInitial: 'J',
      isPro: true
    },
    {
      title: 'Adidas Track Jacket',
      price: 38,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=400&fit=crop',
      seller: 'SarahStyle',
      sellerInitial: 'S',
      isPro: true
    },
    {
      title: 'Champion Sweatshirt',
      price: 29,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop',
      seller: 'MikeVintage',
      sellerInitial: 'M',
      isPro: false
    },
    {
      title: 'Patagonia Fleece',
      price: 65,
      image: 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?w=400&h=400&fit=crop',
      seller: 'EmmaCloset',
      sellerInitial: 'E',
      isPro: true
    }
  ];
  
  // Sample product for ProductCard demo
  const sampleProduct: Product = {
    id: 'demo-1',
    title: 'Vintage Leather Jacket',
    price: 89.99,
    images: [
      { id: '1', image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', position: 0 }
    ],
    condition: 'like_new',
    size: 'M',
    brand_id: 'brand-1',
    category_id: 'jackets',
    seller_id: 'seller-1',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    views: 234,
    likes: 45,
    description: 'Beautiful vintage leather jacket in excellent condition'
  };
  
  const conditions = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'] as const;
</script>

<div class="min-h-screen bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Driplo UI Component Showcase</h1>
      <p class="text-gray-600">Design system components with new black button approach</p>
    </div>

    <!-- Color Palette Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Color Palette</h2>
      
      <div class="grid gap-6">
        <!-- Primary Grays -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Neutral Grays (Primary UI)</h3>
          <div class="flex gap-2 flex-wrap">
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-50 rounded-lg border"></div>
              <p class="text-xs mt-1">gray-50</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-100 rounded-lg"></div>
              <p class="text-xs mt-1">gray-100</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-200 rounded-lg"></div>
              <p class="text-xs mt-1">gray-200</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-300 rounded-lg"></div>
              <p class="text-xs mt-1">gray-300</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-400 rounded-lg"></div>
              <p class="text-xs mt-1">gray-400</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-500 rounded-lg"></div>
              <p class="text-xs mt-1 text-white">gray-500</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-600 rounded-lg"></div>
              <p class="text-xs mt-1 text-white">gray-600</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-700 rounded-lg"></div>
              <p class="text-xs mt-1 text-white">gray-700</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-800 rounded-lg"></div>
              <p class="text-xs mt-1 text-white">gray-800</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-gray-900 rounded-lg"></div>
              <p class="text-xs mt-1 text-white">gray-900</p>
            </div>
          </div>
        </div>

        <!-- Condition Colors -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Condition Status Colors</h3>
          <div class="flex gap-2 flex-wrap">
            <div class="text-center">
              <div class="w-24 h-24 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">New</div>
              <p class="text-xs mt-1">emerald-500</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">New-</div>
              <p class="text-xs mt-1">green-500</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">Like New</div>
              <p class="text-xs mt-1">blue-500</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">Good</div>
              <p class="text-xs mt-1">yellow-500</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-orange-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">Worn</div>
              <p class="text-xs mt-1">orange-500</p>
            </div>
            <div class="text-center">
              <div class="w-24 h-24 bg-red-500 rounded-lg flex items-center justify-center text-white text-xs font-medium">Fair</div>
              <p class="text-xs mt-1">red-500</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Buttons Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Buttons (Black Primary)</h2>
      
      <div class="space-y-6">
        <!-- Button Variants -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Variants</h3>
          <div class="flex gap-3 flex-wrap items-center">
            <Button variant="primary">Primary (Black)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <!-- Button Sizes -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Sizes (Touch Optimized)</h3>
          <div class="flex gap-3 flex-wrap items-end">
            <div class="text-center">
              <Button size="sm">Small (32px)</Button>
              <p class="text-xs text-gray-500 mt-1">Compact UI</p>
            </div>
            <div class="text-center">
              <Button size="md">Medium (36px)</Button>
              <p class="text-xs text-gray-500 mt-1">Standard</p>
            </div>
            <div class="text-center">
              <Button size="lg">Large (40px)</Button>
              <p class="text-xs text-gray-500 mt-1">Primary CTAs</p>
            </div>
          </div>
        </div>

        <!-- Button States -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">States</h3>
          <div class="flex gap-3 flex-wrap">
            <Button>Normal</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
        </div>

        <!-- Real World Examples -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Real World Usage</h3>
          <div class="flex gap-3 flex-wrap">
            <Button size="lg" class="font-semibold">Buy Now €89</Button>
            <Button size="md" variant="outline">Make Offer</Button>
            <Button size="sm" variant="secondary">Follow</Button>
            <Button size="sm" variant="ghost">Share</Button>
          </div>
        </div>
      </div>
    </section>

    <!-- Badges Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Badges</h2>
      
      <div class="space-y-6">
        <!-- General Badges -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">General Purpose Badges</h3>
          <div class="flex gap-2 flex-wrap">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
          </div>
        </div>

        <!-- Condition Badges -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Condition Badges (Original)</h3>
          <div class="bg-gray-100 p-4 rounded-lg">
            <div class="flex gap-3 flex-wrap">
              {#each conditions as condition}
                <div class="relative w-24 h-24 bg-gray-200 rounded">
                  <ConditionBadge {condition} />
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Fine-tuned Condition Badges -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Fine-tuned Condition Badges (Improved)</h3>
          <div class="bg-gray-100 p-4 rounded-lg">
            <div class="flex gap-3 flex-wrap">
              <div class="relative w-24 h-24 bg-gray-200 rounded">
                <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded uppercase tracking-wider">BNWT</div>
              </div>
              <div class="relative w-24 h-24 bg-gray-200 rounded">
                <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded uppercase tracking-wider">NEW</div>
              </div>
              <div class="relative w-24 h-24 bg-gray-200 rounded">
                <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded uppercase tracking-wider">LIKE NEW</div>
              </div>
              <div class="relative w-24 h-24 bg-gray-200 rounded">
                <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-yellow-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded uppercase tracking-wider">GOOD</div>
              </div>
              <div class="relative w-24 h-24 bg-gray-200 rounded">
                <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded uppercase tracking-wider">WORN</div>
              </div>
              <div class="relative w-24 h-24 bg-gray-200 rounded">
                <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded uppercase tracking-wider">FAIR</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Spacing Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Spacing System</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-2 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-0.5 (2px)</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-1 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-1 (4px)</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-1.5 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-1.5 (6px)</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-2 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-2 (8px)</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-2.5 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-2.5 (10px)</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-3 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-3 (12px)</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-4 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-4 (16px)</p>
        </div>
        <div class="bg-white p-4 rounded-lg border">
          <div class="bg-gray-900 h-6 w-full mb-2"></div>
          <p class="text-xs font-medium">spacing-6 (24px)</p>
        </div>
      </div>
    </section>

    <!-- Product Cards Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Product Cards</h2>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <!-- Original Card -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Current</h3>
          <ProductCard product={sampleProduct} />
        </div>
        
        <!-- Improved Card with better spacing -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Improved Spacing</h3>
          <div class="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div class="relative aspect-square bg-gray-100">
              <img 
                src={sampleProduct.images[0].image_url} 
                alt={sampleProduct.title}
                class="w-full h-full object-cover"
              />
              <div class="absolute top-2 left-2 px-1.5 py-0.5 bg-blue-500/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded uppercase tracking-wider">
                LIKE NEW
              </div>
            </div>
            <div class="p-3">
              <p class="text-xs text-gray-500 uppercase tracking-wider">Vintage</p>
              <h3 class="text-sm font-medium text-gray-900 line-clamp-1 mt-0.5">{sampleProduct.title}</h3>
              <div class="flex items-center justify-between mt-2">
                <p class="text-base font-semibold text-gray-900">€{sampleProduct.price}</p>
                <div class="flex items-center gap-1">
                  <span class="text-xs text-gray-500">234</span>
                  <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Forms Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Form Elements</h2>
      
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Input Fields</h3>
          <div class="space-y-3">
            <Input placeholder="Standard input (36px)" bind:value={inputValue} />
            <Input placeholder="Disabled input" disabled />
            <textarea 
              class="w-full px-3 py-2.5 text-base sm:text-sm border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 min-h-[80px]"
              placeholder="Textarea with consistent styling"
            ></textarea>
          </div>
        </div>
        
        <div>
          <h3 class="text-sm font-medium text-gray-700 mb-3">Select & Buttons</h3>
          <div class="space-y-3">
            <select 
              class="w-full px-3 py-2.5 text-base sm:text-sm border border-gray-300 rounded-lg focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 bg-white"
              bind:value={selectValue}
            >
              <option value="">Choose an option</option>
              <option value="1">Option 1</option>
              <option value="2">Option 2</option>
            </select>
            <div class="flex gap-2">
              <Button variant="outline" class="flex-1">Cancel</Button>
              <Button variant="primary" class="flex-1">Submit</Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Typography Section -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Typography Scale</h2>
      
      <div class="space-y-3">
        <p class="text-4xl font-bold text-gray-900">Display (36px) - Hero headings</p>
        <p class="text-3xl font-semibold text-gray-900">Heading 1 (30px) - Page titles</p>
        <p class="text-2xl font-semibold text-gray-900">Heading 2 (24px) - Section titles</p>
        <p class="text-xl font-semibold text-gray-900">Heading 3 (20px) - Subsections</p>
        <p class="text-lg font-medium text-gray-900">Large (18px) - Emphasized text</p>
        <p class="text-base text-gray-900">Base (16px) - Body text</p>
        <p class="text-sm text-gray-700">Small (14px) - Secondary text</p>
        <p class="text-xs text-gray-600">Extra Small (12px) - Captions</p>
        <p class="text-[11px] text-gray-500">2XS (11px) - Fine print</p>
      </div>
    </section>

    <!-- Modal Example -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Modals</h2>
      
      <Button onclick={() => showModal = true}>Open Modal Demo</Button>
      
      <Modal bind:open={showModal}>
        <div class="p-6">
          <h3 class="text-lg font-semibold mb-4">Modal with New Design System</h3>
          <p class="text-sm text-gray-600 mb-6">
            This modal uses our standardized spacing (p-6) and consistent button styles.
          </p>
          <div class="flex gap-3 justify-end">
            <Button variant="outline" onclick={() => showModal = false}>Cancel</Button>
            <Button variant="primary" onclick={() => showModal = false}>Confirm</Button>
          </div>
        </div>
      </Modal>
    </section>

    <!-- Highlight Card Variants Section -->
    <section class="mb-12 bg-white rounded-lg p-6">
      <h2 class="text-2xl font-semibold mb-6">Highlight Card Design Variants</h2>
      <p class="text-gray-600 mb-6">Compare different layouts to improve mobile UX and reduce visual clutter</p>
      
      <!-- Variant selector buttons -->
      <div class="mb-8 flex flex-wrap gap-2">
        <Button 
          onclick={() => selectedHighlightVariant = 0}
          variant={selectedHighlightVariant === 0 ? 'primary' : 'outline'}
          size="sm"
        >
          Current Design
        </Button>
        <Button 
          onclick={() => selectedHighlightVariant = 1}
          variant={selectedHighlightVariant === 1 ? 'primary' : 'outline'}
          size="sm"
        >
          Clean Overlay
        </Button>
        <Button 
          onclick={() => selectedHighlightVariant = 2}
          variant={selectedHighlightVariant === 2 ? 'primary' : 'outline'}
          size="sm"
        >
          Info Bar
        </Button>
        <Button 
          onclick={() => selectedHighlightVariant = 3}
          variant={selectedHighlightVariant === 3 ? 'primary' : 'outline'}
          size="sm"
        >
          Price Focus
        </Button>
        <Button 
          onclick={() => selectedHighlightVariant = 4}
          variant={selectedHighlightVariant === 4 ? 'primary' : 'outline'}
          size="sm"
        >
          No Overlays
        </Button>
        <Button 
          onclick={() => selectedHighlightVariant = 5}
          variant={selectedHighlightVariant === 5 ? 'primary' : 'outline'}
          size="sm"
        >
          Minimal
        </Button>
        <Button 
          onclick={() => selectedHighlightVariant = 6}
          variant={selectedHighlightVariant === 6 ? 'primary' : 'outline'}
          size="sm"
        >
          Instagram Style
        </Button>
        <Button 
          onclick={() => selectedHighlightVariant = 7}
          variant={selectedHighlightVariant === 7 ? 'primary' : 'outline'}
          size="sm"
        >
          Clean Focus
        </Button>
      </div>

      <!-- Display selected variant -->
      <div class="bg-gray-50 p-4 rounded-lg mb-6">
        <h3 class="text-sm font-medium text-gray-700 mb-4">
          {selectedHighlightVariant === 0 ? 'Current Design (3 overlays on image)' :
           selectedHighlightVariant === 1 ? 'Variant 1: Clean Overlay (Minimal badges)' :
           selectedHighlightVariant === 2 ? 'Variant 2: Info Bar (Single bottom overlay)' :
           selectedHighlightVariant === 3 ? 'Variant 3: Price Focus (E-commerce standard)' :
           selectedHighlightVariant === 4 ? 'Variant 4: No Overlays (Card extension)' :
           selectedHighlightVariant === 5 ? 'Variant 5: Minimal (Ultra clean)' :
           selectedHighlightVariant === 6 ? 'Variant 6: Instagram Style (Avatar next to title, price badge bottom-center)' :
           'Variant 7: Clean Focus (No avatar, price badge bottom-center)'}
        </h3>
        
        <div class="flex gap-3 overflow-x-auto pb-2">
          {#each [1, 2, 3, 4] as copy}
            {@const product = highlightProducts[copy - 1]}
            {#if selectedHighlightVariant === 0}
              <!-- Current Design -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all">
                  <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-md transition-shadow">
                    <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
                      <figure class="w-36 h-36 relative">
                        <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                        <!-- PRO Badge - Top -->
                        {#if product.isPro}
                          <div class="absolute top-1.5 left-1/2 -translate-x-1/2">
                            <div class="bg-white text-gray-800 text-[9px] font-semibold px-2 py-0.5 rounded-full shadow-sm border border-gray-200">
                              <span class="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">PRO</span>
                            </div>
                          </div>
                        {/if}
                        <!-- Bottom info -->
                        <figcaption class="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <div class="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                            <div class="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600 font-medium">
                              {product.sellerInitial}
                            </div>
                          </div>
                          <div class="bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold px-2 py-1 rounded-lg shadow-sm">
                            {product.price}€
                          </div>
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                  <div class="mt-1.5 px-1 w-36">
                    <h3 class="text-xs text-gray-700 truncate">{product.title}</h3>
                  </div>
                </button>
              </article>

            {:else if selectedHighlightVariant === 1}
              <!-- Variant 1: Clean Overlay -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all">
                  <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-md transition-shadow">
                    <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
                      <figure class="w-36 h-36 relative">
                        <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                        <div class="absolute top-2 left-2">
                          <div class="w-5 h-5 rounded-full border border-white bg-gray-200 overflow-hidden shadow-sm">
                            <div class="w-full h-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-600 font-medium">
                              {product.sellerInitial}
                            </div>
                          </div>
                        </div>
                        <div class="absolute bottom-2 right-2">
                          <div class="bg-black text-white text-sm font-bold px-2.5 py-1.5 rounded-lg shadow-lg">
                            {product.price}€
                          </div>
                        </div>
                      </figure>
                    </div>
                  </div>
                  <div class="mt-1.5 px-1 w-36">
                    <div class="flex items-center gap-1">
                      {#if product.isPro}
                        <span class="bg-gradient-to-r from-amber-500 to-yellow-500 text-[10px] font-bold bg-clip-text text-transparent">PRO</span>
                      {/if}
                      <h3 class="text-xs text-gray-700 truncate flex-1">{product.title}</h3>
                    </div>
                  </div>
                </button>
              </article>

            {:else if selectedHighlightVariant === 2}
              <!-- Variant 2: Info Bar -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all">
                  <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-md transition-shadow">
                    <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
                      <figure class="w-36 h-36 relative">
                        <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                        <figcaption class="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm">
                          <div class="flex items-center justify-between px-2 py-1.5">
                            <div class="flex items-center gap-1.5">
                              <div class="w-5 h-5 rounded-full bg-gray-200 overflow-hidden">
                                <div class="w-full h-full bg-gray-300 flex items-center justify-center text-[10px] text-gray-600 font-medium">
                                  {product.sellerInitial}
                                </div>
                              </div>
                              {#if product.isPro}
                                <span class="bg-gradient-to-r from-amber-500 to-yellow-500 text-[10px] font-bold bg-clip-text text-transparent">PRO</span>
                              {/if}
                            </div>
                            <div class="text-gray-900 text-sm font-bold">{product.price}€</div>
                          </div>
                        </figcaption>
                      </figure>
                    </div>
                  </div>
                  <div class="mt-1.5 px-1 w-36">
                    <h3 class="text-xs text-gray-700 truncate">{product.title}</h3>
                  </div>
                </button>
              </article>

            {:else if selectedHighlightVariant === 3}
              <!-- Variant 3: Price Focus -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all">
                  <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-md transition-shadow">
                    <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
                      <figure class="w-36 h-36 relative">
                        <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                        <div class="absolute bottom-2 right-2">
                          <div class="bg-black text-white text-base font-bold px-3 py-1.5 rounded-xl shadow-lg">
                            {product.price}€
                          </div>
                        </div>
                      </figure>
                    </div>
                  </div>
                  <div class="mt-1.5 px-1 w-36">
                    <div class="flex items-center gap-1 mb-0.5">
                      {#if product.isPro}
                        <svg class="w-3 h-3 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      {/if}
                      <h3 class="text-xs text-gray-700 truncate flex-1">{product.title}</h3>
                    </div>
                    <p class="text-[10px] text-gray-500">@{product.seller}</p>
                  </div>
                </button>
              </article>

            {:else if selectedHighlightVariant === 4}
              <!-- Variant 4: No Overlays -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all">
                  <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-md transition-shadow">
                    <div class="bg-gray-50/80 relative rounded-xl border border-gray-100 overflow-hidden">
                      <figure class="w-36 h-36 relative">
                        <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                      </figure>
                    </div>
                    <div class="px-2 py-1.5">
                      <div class="flex items-center justify-between mb-1">
                        <div class="flex items-center gap-1.5">
                          <div class="w-4 h-4 rounded-full bg-gray-200 overflow-hidden">
                            <div class="w-full h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-600 font-medium">
                              {product.sellerInitial}
                            </div>
                          </div>
                          {#if product.isPro}
                            <span class="bg-gradient-to-r from-amber-500 to-yellow-500 text-[9px] font-bold bg-clip-text text-transparent">PRO</span>
                          {/if}
                        </div>
                        <div class="text-gray-900 text-sm font-bold">{product.price}€</div>
                      </div>
                      <h3 class="text-xs text-gray-700 truncate">{product.title}</h3>
                    </div>
                  </div>
                </button>
              </article>

            {:else if selectedHighlightVariant === 5}
              <!-- Variant 5: Minimal -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-xl transition-all">
                  <div class="relative">
                    <figure class="w-36 h-36 relative rounded-xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                      <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                      <div class="absolute bottom-1.5 right-1.5">
                        <div class="bg-white/90 backdrop-blur text-gray-900 text-xs font-semibold px-2 py-1 rounded-md">
                          {product.price}€
                        </div>
                      </div>
                      {#if product.isPro}
                        <div class="absolute top-1.5 left-1.5">
                          <div class="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                            <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </div>
                        </div>
                      {/if}
                    </figure>
                    <div class="mt-1.5 px-0.5 w-36">
                      <h3 class="text-xs text-gray-700 truncate">{product.title}</h3>
                    </div>
                  </div>
                </button>
              </article>

            {:else if selectedHighlightVariant === 6}
              <!-- Variant 6: Instagram Style -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all pt-2">
                  <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                    <!-- PRO Badge - Outside frame, top center -->
                    {#if product.isPro}
                      <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
                        <div class="bg-black text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                          PRO
                        </div>
                      </div>
                    {/if}
                    
                    <div class="bg-gray-50/60 relative rounded-xl border border-gray-200/60 overflow-hidden backdrop-blur-sm">
                      <figure class="w-36 h-36 relative">
                        <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                      </figure>
                    </div>
                    
                    <!-- Price badge - Bottom center like PRO badge -->
                    <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-10">
                      <div class="bg-black text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                        {product.price}€
                      </div>
                    </div>
                  </div>
                  
                  <!-- Title with avatar (Instagram style) -->
                  <div class="mt-2.5 px-1 w-36">
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-4 rounded-full bg-gray-200 overflow-hidden shrink-0">
                        <div class="w-full h-full bg-gray-300 flex items-center justify-center text-[9px] text-gray-600 font-medium">
                          {product.sellerInitial}
                        </div>
                      </div>
                      <h3 class="text-xs text-gray-700 truncate flex-1">{product.title}</h3>
                    </div>
                  </div>
                </button>
              </article>

            {:else if selectedHighlightVariant === 7}
              <!-- Variant 7: Clean Focus -->
              <article class="relative shrink-0 group">
                <button class="block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black/20 rounded-2xl transition-all pt-2">
                  <div class="relative rounded-2xl shadow-sm bg-white p-1 group-hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                    <!-- PRO Badge - Outside frame, top center -->
                    {#if product.isPro}
                      <div class="absolute -top-1.5 left-1/2 -translate-x-1/2 z-10">
                        <div class="bg-black text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg border border-white/20">
                          PRO
                        </div>
                      </div>
                    {/if}
                    
                    <div class="bg-gray-50/60 relative rounded-xl border border-gray-200/60 overflow-hidden backdrop-blur-sm">
                      <figure class="w-36 h-36 relative">
                        <img src={product.image} alt={product.title} class="w-full h-full object-cover" />
                      </figure>
                    </div>
                    
                    <!-- Price badge - Bottom center like PRO badge -->
                    <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 z-10">
                      <div class="bg-black text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                        {product.price}€
                      </div>
                    </div>
                  </div>
                  
                  <!-- Title only (no avatar) -->
                  <div class="mt-2.5 px-1 w-36">
                    <h3 class="text-xs text-gray-700 truncate text-center">{product.title}</h3>
                  </div>
                </button>
              </article>
            {/if}
          {/each}
        </div>
      </div>

      <!-- Variant comparison -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <div class="p-4">
            <h4 class="font-medium text-sm mb-2">Current Issues</h4>
            <ul class="text-xs text-gray-600 space-y-1">
              <li>❌ 3 overlapping badges clutter image</li>
              <li>❌ PRO badge fights for attention</li>
              <li>❌ Avatar + price compete visually</li>
              <li>❌ Poor mobile tap targets</li>
            </ul>
          </div>
        </Card>
        
        <Card>
          <div class="p-4">
            <h4 class="font-medium text-sm mb-2">Best for Mobile</h4>
            <ul class="text-xs text-gray-600 space-y-1">
              <li>✅ Variant 2: Clean info bar</li>
              <li>✅ Variant 3: Price-focused</li>
              <li>✅ Variant 5: Ultra minimal</li>
            </ul>
          </div>
        </Card>
        
        <Card>
          <div class="p-4">
            <h4 class="font-medium text-sm mb-2">Recommendation</h4>
            <p class="text-xs text-gray-600">
              <strong>Variant 2 (Info Bar)</strong> or <strong>Variant 3 (Price Focus)</strong> provide the best balance of information density and visual clarity for mobile users.
            </p>
          </div>
        </Card>
      </div>
    </section>

    <!-- Visual Hierarchy Demo -->
    <section class="mb-12">
      <h2 class="text-2xl font-semibold mb-6">Visual Hierarchy in Action</h2>
      
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-start gap-4 mb-4">
          <Avatar name="John Doe" size="lg" />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="text-base font-semibold">John's Vintage Store</h3>
              <Badge variant="success" size="sm">Verified</Badge>
              <Badge variant="info" size="sm">Top Seller</Badge>
            </div>
            <p class="text-sm text-gray-600">Selling quality vintage items since 2020</p>
            <div class="flex gap-2 mt-3">
              <Button size="sm" variant="primary">Follow</Button>
              <Button size="sm" variant="outline">Message</Button>
              <Button size="sm" variant="ghost">Share</Button>
            </div>
          </div>
        </div>
        
        <div class="border-t pt-4">
          <p class="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Listings</p>
          <div class="flex gap-2 overflow-x-auto">
            {#each [1,2,3,4] as i}
              <div class="relative w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                <div class="absolute top-1 left-1 px-1 py-0.5 bg-emerald-500/90 text-white text-[9px] font-bold rounded">NEW</div>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </section>

    <!-- Notes Section -->
    <section class="mb-12">
      <Card>
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">Design System Notes</h2>
          <ul class="space-y-2 text-sm text-gray-700">
            <li>✅ <strong>Black primary buttons</strong> - Clear action hierarchy, no confusion with status badges</li>
            <li>✅ <strong>Compact sizing</strong> - 32px/36px/40px for optimal mobile experience</li>
            <li>✅ <strong>OKLCH colors</strong> - Modern, consistent color rendering</li>
            <li>✅ <strong>Status badges</strong> - Bright colors for conditions, light colors for info</li>
            <li>✅ <strong>Consistent spacing</strong> - 4px grid system throughout</li>
            <li>✅ <strong>Touch optimized</strong> - Minimum 32px touch targets</li>
          </ul>
        </div>
      </Card>
    </section>
  </div>
</div>