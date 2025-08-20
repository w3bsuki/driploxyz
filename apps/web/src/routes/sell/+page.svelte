<script lang="ts">
  import { goto } from '$app/navigation';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
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
  
  // Superforms setup
  const { form, errors, constraints, submitting, enhance, message: formMessage } = superForm(data.form, {
    validators: zodClient(ProductSchema),
    resetForm: false,
    taintedMessage: null,
    validationMethod: 'submit-only',
    multipleSubmits: 'prevent',
    defaultValidator: 'clear',
    onResult: ({ result }) => {
      if (result.type === 'success') {
        toasts.add({
          type: 'success',
          message: 'Product listed successfully!',
          duration: 5000
        });
      }
    },
    onError: ({ error }) => {
      toasts.add({
        type: 'error',
        message: error.message || 'Failed to create listing',
        duration: 5000
      });
    }
  });

  // Multi-step form state
  let currentStep = $state(1);
  const totalSteps = 3;
  
  // File handling for photos
  let photoFiles = $state<File[]>([]);
  let photoUrls = $state<string[]>([]);
  
  // Get categories from server data
  const mainCategories = $derived(data.categories.filter(c => !c.parent_id));
  const getSubcategories = (parentId: string) => 
    data.categories.filter(c => c.parent_id === parentId);

  // Steps configuration
  const steps = [
    { id: 1, title: 'Photos & Details', description: 'Upload images and basic info' },
    { id: 2, title: 'Product Info', description: 'Brand, size, and condition' },
    { id: 3, title: 'Price & Publish', description: 'Set your price and go live' }
  ];

  // Completed steps tracking
  const completedSteps = $derived(() => {
    const completed = [];
    if (photoUrls.length > 0 && $form.title && $form.category_id) {
      completed.push(1);
    }
    if ($form.brand && $form.size && $form.condition) {
      completed.push(2);
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
        return photoUrls.length > 0 && $form.title && $form.category_id;
      case 2: 
        return $form.brand && $form.size && $form.condition;
      case 3: 
        return $form.price && $form.shipping_cost >= 0;
      default: 
        return false;
    }
  }

  // Handle image changes
  function handleImagesChange(images: string[]) {
    photoUrls = images;
    $form.photos_count = images.length;
  }

  // Handle form submission
  async function handleSubmit(e: Event) {
    if (!canProceedToNext()) return;
    
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    // Add photo files
    photoFiles.forEach(file => {
      formData.append('photos', file);
    });
    
    return enhance(e);
  }

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
      <!-- Form Messages -->
      {#if $errors._errors?.length}
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <p class="text-red-800">{$errors._errors[0]}</p>
          </div>
        </div>
      {/if}

      <!-- Multi-step Form -->
      <form method="POST" use:enhance={handleSubmit} enctype="multipart/form-data">
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
                  images={photoUrls}
                  onImagesChange={handleImagesChange}
                  maxImages={10}
                  error={$errors.photos_count}
                  helpText="Add up to 10 photos. First photo will be the cover image."
                  convertToWebP={true}
                />
              </div>

              <!-- Title -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  bind:value={$form.title}
                  type="text"
                  placeholder="e.g. Vintage Levi's Denim Jacket"
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {$errors.title 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                  {...$constraints.title}
                />
                {#if $errors.title}
                  <p class="mt-1 text-sm text-red-600">{$errors.title}</p>
                {/if}
              </div>

              <!-- Description -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  bind:value={$form.description}
                  rows="4"
                  placeholder="Describe your item, including any flaws or special features..."
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {$errors.description 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                  {...$constraints.description}
                ></textarea>
                {#if $errors.description}
                  <p class="mt-1 text-sm text-red-600">{$errors.description}</p>
                {/if}
              </div>

              <!-- Category -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Category <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={$form.category_id}
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {$errors.category_id 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                  {...$constraints.category_id}
                >
                  <option value="">Select category</option>
                  {#each mainCategories as category}
                    <option value={category.id}>{category.name}</option>
                  {/each}
                </select>
                {#if $errors.category_id}
                  <p class="mt-1 text-sm text-red-600">{$errors.category_id}</p>
                {/if}
              </div>

              <!-- Subcategory -->
              {#if $form.category_id}
                {@const subcategories = getSubcategories($form.category_id)}
                {#if subcategories.length > 0}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory
                    </label>
                    <select
                      bind:value={$form.subcategory_id}
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
                bind:value={$form.brand}
                popularBrands={POPULAR_BRANDS}
                label="Brand"
                error={$errors.brand}
                required
              />

              <!-- Size -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Size <span class="text-red-500">*</span>
                </label>
                <select
                  bind:value={$form.size}
                  class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1
                    {$errors.size 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                  {...$constraints.size}
                >
                  <option value="">Select size</option>
                  {#each SIZE_CATEGORIES.clothing as size}
                    <option value={size.value}>{size.label}</option>
                  {/each}
                </select>
                {#if $errors.size}
                  <p class="mt-1 text-sm text-red-600">{$errors.size}</p>
                {/if}
              </div>

              <!-- Condition -->
              <ConditionSelector
                bind:value={$form.condition}
                label="Condition"
                error={$errors.condition}
                required
              />

              <!-- Color & Material -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    bind:value={$form.color}
                    type="text"
                    placeholder="e.g. Blue, Red, Multi"
                    class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...$constraints.color}
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    bind:value={$form.material}
                    type="text"
                    placeholder="e.g. Cotton, Polyester"
                    class="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    {...$constraints.material}
                  />
                </div>
              </div>
            </div>

          {:else if currentStep === 3}
            <!-- Step 3: Price & Publish -->
            <div class="p-6 space-y-6">
              <!-- Price -->
              <PriceInput
                bind:value={$form.price}
                label="Price"
                error={$errors.price}
                required
                showCalculation={true}
                feePercentage={5}
                helpText="Set a competitive price to sell faster"
              />

              <!-- Shipping Price -->
              <PriceInput
                bind:value={$form.shipping_cost}
                label="Shipping Cost"
                error={$errors.shipping_cost}
                required
                helpText="Buyer pays shipping. Set to 0 for free shipping."
              />

              <!-- Tags -->
              <TagInput
                bind:tags={$form.tags}
                label="Tags"
                placeholder="Add tags to help buyers find your item"
                suggestions={tagSuggestions}
                error={$errors.tags}
                helpText="Add relevant keywords to improve discoverability"
              />

              <!-- Premium Boost -->
              {#if data.profile?.subscription_tier === 'premium' && data.profile?.premium_boosts_remaining > 0}
                <div class="border-t pt-6">
                  <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                    <label class="flex items-start space-x-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        bind:checked={$form.use_premium_boost}
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
                type="submit"
                disabled={$submitting || !canProceedToNext()}
                class="flex-1 sm:flex-none h-12 text-base font-medium"
              >
                {#if $submitting}
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
      </form>
    {/if}
  </div>
</div>