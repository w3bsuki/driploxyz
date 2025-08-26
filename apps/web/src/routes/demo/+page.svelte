<script lang="ts">
  import { Button, Badge, ProductCard, Modal, Input, Select, ConditionBadge, Avatar, Card } from '@repo/ui';
  import type { Product } from '@repo/database';
  
  let showModal = $state(false);
  let inputValue = $state('');
  let selectValue = $state('');
  
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