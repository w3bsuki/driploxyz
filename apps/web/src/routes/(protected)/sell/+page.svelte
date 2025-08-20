<script lang="ts">
  import { goto } from '$app/navigation';
  import { createProduct, getPriceSuggestions } from '$lib/remote/products.remote';
  import { ProductSchema, POPULAR_BRANDS, SIZE_CATEGORIES } from '$lib/validation/product';
  import type { PageData } from './$types';
  import { 
    Button, 
    Input, 
    Select,
    ImageUploader,
    StepIndicator, 
    ConditionSelector,
    BrandSelector,
    PriceInput,
    TagInput,
    toasts
  } from '@repo/ui';
  import Header from '$lib/components/Header.svelte';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
  
  // Form state using runes
  let formData = $state({
    title: '',
    description: '',
    category_id: '',
    subcategory_id: '',
    brand: '',
    size: '',
    condition: 'good' as const,
    color: '',
    material: '',
    price: 0,
    shipping_cost: 0,
    tags: [] as string[],
    use_premium_boost: false
  });
  
  let submitting = $state(false);
  let errors = $state<Record<string, string>>({});
  let priceSuggestion = $state<{
    suggested: number | null;
    range: { min: number; max: number } | null;
    confidence: 'low' | 'medium' | 'high';
  } | null>(null);
  
  // Create form function
  const productForm = createProduct.form();

  // Multi-step form state
  let currentStep = $state(1);
  const totalSteps = 4;
  let isReviewing = $state(false);
  
  // File handling for photos
  let photoFiles = $state<File[]>([]);
  let photoUrls = $state<string[]>([]);
  
  // Get categories from server data
  const mainCategories = $derived((data.categories || []).filter(c => !c.parent_id));
  const getSubcategories = (parentId: string) => 
    (data.categories || []).filter(c => c.parent_id === parentId);

  // Steps configuration
  const steps = [
    { id: 1, title: 'Photos & Details', description: 'Upload images and basic info' },
    { id: 2, title: 'Product Info', description: 'Brand, size, and condition' },
    { id: 3, title: 'Pricing', description: 'Set your price' },
    { id: 4, title: 'Review', description: 'Review and publish' }
  ];

  // Completed steps tracking
  const completedSteps = $derived(() => {
    const completed = [];
    if (photoUrls.length > 0 && formData.title && formData.category_id) {
      completed.push(1);
    }
    if (formData.brand && formData.size && formData.condition) {
      completed.push(2);
    }
    if (formData.price && formData.shipping_cost >= 0) {
      completed.push(3);
    }
    return completed;
  });

  // Navigation functions
  function nextStep() {
    if (currentStep < totalSteps && canProceedToNext()) {
      currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function goToStep(step: number) {
    if (step <= currentStep || completedSteps().includes(step - 1)) {
      currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function canProceedToNext() {
    switch(currentStep) {
      case 1: 
        return photoUrls.length > 0 && formData.title && formData.category_id;
      case 2: 
        return formData.brand && formData.size && formData.condition;
      case 3: 
        return formData.price && formData.shipping_cost >= 0;
      case 4:
        return true; // Review step can always submit
      default: 
        return false;
    }
  }

  // Handle image changes
  function handleImagesChange(images: string[], files?: File[]) {
    photoUrls = images;
    if (files) {
      photoFiles = files;
    }
  }

  // Handle form submission using remote functions
  async function handleFormSubmit() {
    if (currentStep !== 4) {
      toasts.add({
        type: 'error',
        message: 'Please review your listing before publishing',
        duration: 5000
      });
      return;
    }
    
    if (photoFiles.length === 0) {
      toasts.add({
        type: 'error',
        message: 'At least one photo is required',
        duration: 5000
      });
      return;
    }
    
    submitting = true;
    errors = {};
    
    try {
      // Validate form data
      const validation = ProductSchema.extend({
        photos: ProductSchema.shape.photos || ProductSchema.shape.photos_count
      }).safeParse({
        ...formData,
        photos: photoFiles
      });
      
      if (!validation.success) {
        validation.error.errors.forEach(err => {
          if (err.path.length > 0) {
            errors[err.path[0]] = err.message;
          }
        });
        toasts.add({
          type: 'error',
          message: 'Please fix the form errors',
          duration: 5000
        });
        return;
      }
      
      // Submit using remote function
      const result = await productForm({
        ...formData,
        photos: photoFiles
      });
      
      if (result.success) {
        toasts.add({
          type: 'success',
          message: 'Product listed successfully!',
          duration: 5000
        });
        
        // Redirect to success page
        goto(`/sell/success?id=${result.product.id}`);
      } else {
        throw new Error('Failed to create product');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toasts.add({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to create listing',
        duration: 5000
      });
    } finally {
      submitting = false;
    }
  }
  
  // Get category name by ID
  function getCategoryName(id: string) {
    return (data.categories || []).find(c => c.id === id)?.name || '';
  }
  
  // Get price suggestions when category, brand, and condition change
  async function updatePriceSuggestions() {
    if (!formData.category_id || !formData.condition) return;
    
    try {
      priceSuggestion = await getPriceSuggestions({
        categoryId: formData.category_id,
        brand: formData.brand || undefined,
        condition: formData.condition,
        size: formData.size || undefined
      });
    } catch (error) {
      console.error('Failed to get price suggestions:', error);
    }
  }
  
  // Watch for changes that should trigger price suggestions
  $effect(() => {
    if (formData.category_id && formData.condition && formData.brand) {
      updatePriceSuggestions();
    }
  });

  // Tag suggestions
  const tagSuggestions = [
    'vintage', 'designer', 'streetwear', 'minimalist', 'boho', 
    'formal', 'casual', 'summer', 'winter', 'retro', 'y2k',
    'sustainable', 'handmade', 'limited edition', 'rare', 'authentic'
  ];
</script>

<svelte:head>
  <title>Sell Your Item - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <!-- Mobile-optimized Header -->
  <div class="bg-white border-b sticky top-14 z-30">
    <div class="max-w-4xl mx-auto px-4">
      <div class="flex items-center justify-between py-3">
        <button
          onclick={() => goto('/dashboard')}
          class="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Go back"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h1 class="text-lg font-semibold text-gray-900">List an Item</h1>
        
        <button
          onclick={() => goto('/help/selling')}
          class="p-2 -mr-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Help"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Progress Indicator -->
  <div class="bg-white border-b">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <StepIndicator 
        {steps} 
        {currentStep} 
        completedSteps={completedSteps()}
        onStepClick={goToStep}
      />
    </div>
  </div>

  <!-- Form Content -->
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- Error Messages -->
    {#if Object.keys(errors).length > 0}
      <div class="mb-4">
        <div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3">
          <svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-red-800 font-medium">Please fix the following errors:</p>
            <ul class="mt-1 text-sm list-disc list-inside">
              {#each Object.entries(errors) as [field, message]}
                <li>{message}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    {/if}
    
    {#if data.needsBrandSubscription}
      <!-- Brand Subscription Required -->
      <div class="bg-white rounded-lg shadow-sm p-6 text-center">
        <div class="max-w-md mx-auto space-y-4">
          <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Brand Subscription Required</h2>
            <p class="text-gray-600 mt-2">
              To list products as a business account, you need an active Brand subscription.
            </p>
          </div>

          {#if data.plans.find(p => p.plan_type === 'brand')}
            {@const brandPlan = data.plans.find(p => p.plan_type === 'brand')}
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="text-2xl font-bold text-gray-900">
                ${brandPlan.price_monthly}/month
              </div>
              <ul class="mt-3 space-y-2 text-sm text-gray-600">
                <li class="flex items-start">
                  <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Unlimited product listings
                </li>
                <li class="flex items-start">
                  <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Brand verification badge
                </li>
                <li class="flex items-start">
                  <svg class="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  Priority customer support
                </li>
              </ul>
            </div>
          {/if}

          <div class="space-y-3">
            <Button 
              href="/dashboard/upgrade" 
              class="w-full h-12 text-base font-medium"
            >
              Upgrade to Brand Plan
            </Button>
            <Button 
              href="/profile/edit" 
              variant="outline" 
              class="w-full h-12 text-base font-medium"
            >
              Switch to Personal Account
            </Button>
          </div>
        </div>
      </div>
    {:else}
      <!-- Multi-step Form -->
      <div>
        
        <div class="bg-white rounded-lg shadow-sm">
          {#if currentStep === 1}
            <!-- Step 1: Photos & Details -->
            <div class="p-6 space-y-6">
              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Photos <span class="text-red-500">*</span>
                </label>
                <ImageUploader
                  bind:images={photoUrls}
                  bind:files={photoFiles}
                  maxImages={10}
                  error={errors.photos}
                  helpText="Add up to 10 photos. First photo will be the cover image."
                />
              </div>

              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  bind:value={formData.title}
                  type="text"
                  placeholder="e.g. Vintage Levi's Denim Jacket"
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {errors.title 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                  maxlength="50"
                />
                {#if errors.title}
                  <p class="mt-1 text-sm text-red-600">{errors.title}</p>
                {/if}
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  bind:value={formData.description}
                  rows="4"
                  placeholder="Describe your item, including any flaws or special features..."
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {errors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                  maxlength="500"
                ></textarea>
                {#if errors.description}
                  <p class="mt-1 text-sm text-red-600">{errors.description}</p>
                {/if}
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={formData.category_id}
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {errors.category_id 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                >
                  <option value="">Select category</option>
                  {#each mainCategories as category}
                    <option value={category.id}>{category.name}</option>
                  {/each}
                </select>
                {#if errors.category_id}
                  <p class="mt-1 text-sm text-red-600">{errors.category_id}</p>
                {/if}
              </div>

              <!-- Subcategory -->
              {#if formData.category_id}
                {@const subcategories = getSubcategories(formData.category_id)}
                {#if subcategories.length > 0}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory
                    </label>
                    <select
                      bind:value={formData.subcategory_id}
                      class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select subcategory</option>
                      {#each subcategories as subcategory}
                        <option value={subcategory.id}>{subcategory.name}</option>
                      {/each}
                    </select>
                  </div>
                {/if}
              {/if}
            </div>

          {:else if currentStep === 2}
            <!-- Step 2: Product Info -->
            <div class="p-6 space-y-6">
              <!-- Brand -->
              <BrandSelector
                bind:value={formData.brand}
                popularBrands={POPULAR_BRANDS}
                label="Brand"
                error={errors.brand}
                required
              />

              <!-- Size -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Size <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={formData.size}
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {errors.size 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                >
                  <option value="">Select size</option>
                  {#each SIZE_CATEGORIES.clothing as size}
                    <option value={size.value}>{size.label}</option>
                  {/each}
                </select>
                {#if errors.size}
                  <p class="mt-1 text-sm text-red-600">{errors.size}</p>
                {/if}
              </div>

              <!-- Condition -->
              <ConditionSelector
                bind:value={formData.condition}
                label="Condition"
                error={errors.condition}
                required
              />

              <!-- Color & Material -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    bind:value={formData.color}
                    type="text"
                    placeholder="e.g. Blue, Red, Multi"
                    class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    maxlength="30"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    bind:value={formData.material}
                    type="text"
                    placeholder="e.g. Cotton, Polyester"
                    class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    maxlength="50"
                  />
                </div>
              </div>
            </div>

          {:else if currentStep === 3}
            <!-- Step 3: Price & Publish -->
            <div class="p-6 space-y-6">
              <!-- Price -->
              <div>
                <PriceInput
                  bind:value={formData.price}
                  label="Price"
                  error={errors.price}
                  required
                  showCalculation={true}
                  feePercentage={5}
                  helpText="Set a competitive price to sell faster"
                />
                
                <!-- Price Suggestions -->
                {#if priceSuggestion && priceSuggestion.suggested}
                  <div class="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div class="flex items-center space-x-2 mb-1">
                      <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span class="text-sm font-medium text-blue-900">Price Suggestion</span>
                      <span class="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full">
                        {priceSuggestion.confidence} confidence
                      </span>
                    </div>
                    <p class="text-sm text-blue-800">
                      Similar items sold for <strong>${priceSuggestion.suggested}</strong>
                      {#if priceSuggestion.range}
                        (range: ${priceSuggestion.range.min} - ${priceSuggestion.range.max})
                      {/if}
                    </p>
                    <button
                      type="button"
                      onclick={() => formData.price = priceSuggestion?.suggested || 0}
                      class="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Use suggested price
                    </button>
                  </div>
                {/if}
              </div>

              <!-- Shipping Price -->
              <PriceInput
                bind:value={formData.shipping_cost}
                label="Shipping Cost"
                error={errors.shipping_cost}
                required
                helpText="Buyer pays shipping. Set to 0 for free shipping."
              />

              <!-- Tags -->
              <TagInput
                bind:tags={formData.tags}
                label="Tags"
                placeholder="Add tags to help buyers find your item"
                suggestions={tagSuggestions}
                error={errors.tags}
                helpText="Add relevant keywords to improve discoverability"
              />

              <!-- Premium Boost -->
              {#if data.profile?.subscription_tier === 'premium' && data.profile?.premium_boosts_remaining > 0}
                <div class="border-t pt-6">
                  <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <label class="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={formData.use_premium_boost}
                        class="mt-1 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                      />
                      <div class="flex-1">
                        <div class="flex items-center space-x-2">
                          <span class="text-lg">✨</span>
                          <span class="font-medium text-gray-900">Boost this listing</span>
                          <span class="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-xs rounded-full">
                            {data.profile.premium_boosts_remaining} left
                          </span>
                        </div>
                        <p class="text-sm text-gray-600 mt-1">
                          Get 3x more visibility for 7 days
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              {/if}
            </div>
          {:else if currentStep === 4}
            <!-- Step 4: Review & Publish -->
            <div class="p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Review Your Listing</h2>
              
              <!-- Photos Preview -->
              <div class="mb-6">
                <h3 class="text-sm font-medium text-gray-700 mb-2">Photos</h3>
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {#each photoUrls as url, index}
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={url} alt="Product {index + 1}" class="w-full h-full object-cover" />
                    </div>
                  {/each}
                </div>
              </div>
              
              <!-- Product Details -->
              <div class="space-y-4 border-t pt-4">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span class="text-xs text-gray-500">Title</span>
                    <p class="font-medium text-gray-900">{formData.title}</p>
                  </div>
                  
                  <div>
                    <span class="text-xs text-gray-500">Category</span>
                    <p class="font-medium text-gray-900">
                      {getCategoryName(formData.category_id)}
                      {#if formData.subcategory_id}
                        / {getCategoryName(formData.subcategory_id)}
                      {/if}
                    </p>
                  </div>
                  
                  <div>
                    <span class="text-xs text-gray-500">Brand</span>
                    <p class="font-medium text-gray-900">{formData.brand}</p>
                  </div>
                  
                  <div>
                    <span class="text-xs text-gray-500">Size</span>
                    <p class="font-medium text-gray-900">{formData.size}</p>
                  </div>
                  
                  <div>
                    <span class="text-xs text-gray-500">Condition</span>
                    <p class="font-medium text-gray-900 capitalize">{formData.condition}</p>
                  </div>
                  
                  {#if formData.color}
                    <div>
                      <span class="text-xs text-gray-500">Color</span>
                      <p class="font-medium text-gray-900">{formData.color}</p>
                    </div>
                  {/if}
                  
                  {#if formData.material}
                    <div>
                      <span class="text-xs text-gray-500">Material</span>
                      <p class="font-medium text-gray-900">{formData.material}</p>
                    </div>
                  {/if}
                </div>
                
                {#if formData.description}
                  <div>
                    <span class="text-xs text-gray-500">Description</span>
                    <p class="text-sm text-gray-700 mt-1">{formData.description}</p>
                  </div>
                {/if}
                
                <!-- Pricing -->
                <div class="border-t pt-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">Item Price</span>
                    <span class="font-medium text-gray-900">${formData.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-sm text-gray-600">Shipping Cost</span>
                    <span class="font-medium text-gray-900">
                      {formData.shipping_cost > 0 ? `$${formData.shipping_cost.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t">
                    <span class="text-sm font-medium text-gray-900">Buyer Pays</span>
                    <span class="text-lg font-bold text-gray-900">
                      ${((formData.price || 0) + (formData.shipping_cost || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div class="flex justify-between items-center mt-1">
                    <span class="text-xs text-gray-500">You receive (after 5% fee)</span>
                    <span class="text-sm font-medium text-green-600">
                      ${((formData.price || 0) * 0.95).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                {#if formData.tags?.length > 0}
                  <div>
                    <span class="text-xs text-gray-500">Tags</span>
                    <div class="flex flex-wrap gap-1 mt-1">
                      {#each formData.tags as tag}
                        <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">{tag}</span>
                      {/each}
                    </div>
                  </div>
                {/if}
                
                {#if formData.use_premium_boost}
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">✨</span>
                      <span class="text-sm font-medium text-gray-900">Premium Boost Applied</span>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">3x more visibility for 7 days</p>
                  </div>
                {/if}
              </div>
              
              <!-- Terms Notice -->
              <div class="mt-6 p-4 bg-blue-50 rounded-lg">
                <p class="text-xs text-blue-800">
                  By publishing, you agree to our terms of service and confirm that this item is authentic and accurately described.
                </p>
              </div>
            </div>
          {/if}
        </div>
        
        <!-- Navigation Buttons - Fixed on Mobile -->
        <div class="sticky bottom-0 bg-white border-t mt-6 px-4 py-3 -mx-4 sm:relative sm:bottom-auto sm:bg-transparent sm:border-0 sm:px-0">
          <div class="flex gap-3">
            <Button 
              type="button"
              onclick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
              class="flex-1 sm:flex-none h-12 text-base font-medium"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            
            {#if currentStep < totalSteps}
              <Button 
                type="button"
                onclick={nextStep}
                disabled={!canProceedToNext()}
                class="flex-1 sm:flex-none h-12 text-base font-medium"
              >
                Next
                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            {:else}
              <Button 
                type="button"
                onclick={handleFormSubmit}
                disabled={submitting || !canProceedToNext()}
                class="flex-1 sm:flex-none h-12 text-base font-medium"
              >
                {#if submitting}
                  <svg class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                {:else}
                  Publish Listing
                {/if}
              </Button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>