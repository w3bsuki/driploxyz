<script lang="ts">
  import { goto } from '$app/navigation';
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { ProductSchema, POPULAR_BRANDS, SIZE_CATEGORIES } from '$lib/validation/product';
  import type { PageData } from './$types';
  import * as i18n from '@repo/i18n';
  import { 
    Button, 
    Input, 
    Select,
    ImageUploader,
    StepIndicator, 
    ConditionSelector,
    BrandSelector,
    PriceInput,
    TagInput
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
    validationMethod: 'oninput',
    multipleSubmits: 'prevent',
    onUpdated: ({ form }) => {
      if (form.message) {
        // Form message handled by reactive display
      }
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
    { id: 1, title: i18n.sell_photosAndDetails(), description: 'Add photos and basic info' },
    { id: 2, title: i18n.sell_productInfo(), description: 'Product details' },
    { id: 3, title: i18n.sell_priceAndPublish(), description: 'Set price and publish' }
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
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      currentStep--;
    }
  }

  function goToStep(step: number) {
    if (step <= currentStep || completedSteps().includes(step - 1)) {
      currentStep = step;
    }
  }

  function canProceedToNext() {
    switch(currentStep) {
      case 1: 
        return photoUrls.length > 0 && $form.title && $form.category_id;
      case 2: 
        return $form.brand && $form.size && $form.condition;
      case 3: 
        return $form.price && $form.shipping_cost;
      default: 
        return false;
    }
  }

  // Handle image changes
  function handleImagesChange(images: string[]) {
    photoUrls = images;
    // Update form with photo count for validation
    $form.photos_count = images.length;
  }

  // Handle form submission
  async function handleSubmit(e: Event) {
    if (!canProceedToNext()) return;
    
    // Add files to form data before submitting
    const formElement = e.target as HTMLFormElement;
    const formData = new FormData(formElement);
    
    // Add photo files
    photoFiles.forEach(file => {
      formData.append('photos', file);
    });
    
    // Let Superforms handle the rest
    return enhance(e);
  }

  // Tag suggestions for better UX
  const tagSuggestions = [
    'vintage', 'designer', 'streetwear', 'minimalist', 'boho', 
    'formal', 'casual', 'summer', 'winter', 'retro', 'y2k',
    'sustainable', 'handmade', 'limited edition'
  ];
</script>

<svelte:head>
  <title>{i18n.sell_listItem()} - Driplo</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <Header />
  
  <!-- Page Header -->
  <div class="bg-white shadow-xs sticky top-14 sm:top-16 z-30">
    <div class="max-w-3xl mx-auto px-4 sm:px-6">
      <div class="flex justify-between items-center py-3">
        <div class="flex items-center space-x-3">
          <a href="/dashboard" class="text-gray-600 hover:text-gray-900 p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 class="text-lg font-semibold text-gray-900">{i18n.sell_listItem()}</h1>
        </div>
      </div>
    </div>
  </div>

  <!-- Progress Indicator -->
  <div class="bg-white border-b">
    <div class="max-w-3xl mx-auto px-4 sm:px-6 py-4">
      <StepIndicator 
        {steps} 
        {currentStep} 
        completedSteps={completedSteps()}
        onStepClick={goToStep}
      />
    </div>
  </div>

  <!-- Form Content -->
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-6">
    {#if data.needsBrandSubscription}
      <!-- Brand Subscription Required -->
      <div class="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="text-center space-y-4">
          <div class="text-4xl">🏢</div>
          <div>
            <h3 class="text-lg font-medium text-blue-800">{i18n.sell_brandSubscriptionRequired()}</h3>
            <p class="text-blue-700 mt-1">{i18n.sell_brandSubscriptionDescription()}</p>
          </div>
          
          {#if data.plans.find(p => p.plan_type === 'brand')}
            {@const brandPlan = data.plans.find(p => p.plan_type === 'brand')}
            <div class="bg-white p-4 rounded-lg border border-blue-200">
              <div class="text-sm text-blue-800 space-y-2">
                <p><strong>{i18n.sell_brandPlanFeatures()}</strong></p>
                <div class="text-lg font-bold text-blue-900 mt-3">
                  {brandPlan.price_monthly} {brandPlan.currency}/{i18n.sell_month()}
                </div>
              </div>
            </div>
          {/if}
          
          <div class="space-y-2">
            <Button href="/dashboard/upgrade" class="w-full" size="lg">
              {i18n.sell_subscribeToBrandPlan()}
            </Button>
            <Button href="/profile/edit" variant="outline" class="w-full">
              {i18n.sell_switchToPersonalAccount()}
            </Button>
          </div>
        </div>
      </div>
    {:else}
      <!-- Form Messages -->
      {#if $errors._errors?.length}
        <div class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p class="text-red-800">{$errors._errors[0]}</p>
        </div>
      {/if}

      {#if formMessage}
        <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p class="text-green-800">{formMessage}</p>
        </div>
      {/if}

      <!-- Multi-step Form -->
      <form method="POST" use:enhance={handleSubmit} enctype="multipart/form-data">
        {#if currentStep === 1}
          <!-- Step 1: Photos & Details -->
          <div class="bg-white rounded-lg p-6 space-y-6">
            <!-- Image Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {i18n.sell_photos()}*
              </label>
              <ImageUploader
                images={photoUrls}
                onImagesChange={handleImagesChange}
                maxImages={10}
                error={$errors.photos_count}
                helpText="First photo will be the main image"
                convertToWebP={true}
              />
            </div>

            <!-- Title -->
            <Input
              bind:value={$form.title}
              label={i18n.sell_title()}
              placeholder={i18n.sell_titlePlaceholder()}
              error={$errors.title}
              required
              {...$constraints.title}
            />

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                {i18n.sell_description()}
              </label>
              <textarea
                bind:value={$form.description}
                rows="4"
                placeholder={i18n.sell_descriptionPlaceholder()}
                class="block w-full rounded-lg border px-3 py-2 text-sm placeholder-gray-500 transition-colors focus:outline-hidden focus:ring-1
                  {$errors.description 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                {...$constraints.description}
              ></textarea>
              {#if $errors.description}
                <p class="text-sm text-red-600 mt-1">{$errors.description}</p>
              {/if}
            </div>

            <!-- Category -->
            <Select
              bind:value={$form.category_id}
              options={mainCategories.map(c => ({ value: c.id, label: c.name }))}
              label={i18n.sell_category()}
              placeholder={i18n.sell_selectCategory()}
              error={$errors.category_id}
              required
              {...$constraints.category_id}
            />

            <!-- Subcategory -->
            {#if $form.category_id}
              {@const subcategories = getSubcategories($form.category_id)}
              {#if subcategories.length > 0}
                <Select
                  bind:value={$form.subcategory_id}
                  options={subcategories.map(c => ({ value: c.id, label: c.name }))}
                  label={i18n.sell_subcategory()}
                  placeholder={i18n.sell_selectSubcategory()}
                  error={$errors.subcategory_id}
                />
              {/if}
            {/if}
          </div>

        {:else if currentStep === 2}
          <!-- Step 2: Product Info -->
          <div class="bg-white rounded-lg p-6 space-y-6">
            <!-- Brand -->
            <BrandSelector
              bind:value={$form.brand}
              popularBrands={POPULAR_BRANDS}
              label={i18n.sell_brand()}
              error={$errors.brand}
              required
              {...$constraints.brand}
            />

            <!-- Size -->
            <Select
              bind:value={$form.size}
              options={SIZE_CATEGORIES.clothing}
              label={i18n.sell_size()}
              placeholder="Select size"
              error={$errors.size}
              required
              {...$constraints.size}
            />

            <!-- Condition -->
            <ConditionSelector
              bind:value={$form.condition}
              label="Condition"
              error={$errors.condition}
              required
              {...$constraints.condition}
            />

            <!-- Color & Material -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                bind:value={$form.color}
                label="Color"
                placeholder="e.g. Blue, Red, Multi"
                error={$errors.color}
                {...$constraints.color}
              />
              
              <Input
                bind:value={$form.material}
                label="Material"
                placeholder="e.g. Cotton, Polyester"
                error={$errors.material}
                {...$constraints.material}
              />
            </div>
          </div>

        {:else if currentStep === 3}
          <!-- Step 3: Price & Publish -->
          <div class="bg-white rounded-lg p-6 space-y-6">
            <!-- Price -->
            <PriceInput
              bind:value={$form.price}
              label="Price"
              error={$errors.price}
              required
              showCalculation={true}
              feePercentage={5}
              helpText="Set a competitive price to sell faster"
              {...$constraints.price}
            />

            <!-- Shipping Price -->
            <PriceInput
              bind:value={$form.shipping_cost}
              label="Shipping Price"
              error={$errors.shipping_cost}
              required
              helpText="Buyer pays shipping"
              {...$constraints.shipping_cost}
            />

            <!-- Tags -->
            <TagInput
              bind:tags={$form.tags}
              label="Tags"
              placeholder="Add tags to help buyers find your item"
              suggestions={tagSuggestions}
              error={$errors.tags}
              helpText="Tags help buyers discover your item"
            />

            <!-- Premium Boost -->
            {#if data.profile?.subscription_tier === 'premium' && data.profile?.premium_boosts_remaining > 0}
              <div class="border-t pt-6">
                <div class="bg-linear-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <div class="flex items-start space-x-3">
                    <div class="text-2xl">⭐</div>
                    <div class="flex-1">
                      <h3 class="text-lg font-medium text-yellow-800">Boost Your Listing</h3>
                      <p class="text-yellow-700 text-sm mt-1">Give your product premium visibility</p>
                      
                      <div class="mt-3">
                        <label class="flex items-center space-x-2">
                          <input 
                            type="checkbox" 
                            bind:checked={$form.use_premium_boost}
                            class="rounded-sm border-gray-300 text-yellow-600 focus:ring-yellow-500"
                          />
                          <span class="text-sm font-medium text-yellow-800">
                            Use Premium Boost ({data.profile.premium_boosts_remaining} remaining)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
        
        <!-- Navigation Buttons -->
        <div class="flex justify-between mt-6">
          <Button 
            type="button"
            onclick={prevStep}
            variant="outline"
            disabled={currentStep === 1}
            class="flex items-center"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
          
          {#if currentStep < totalSteps}
            <Button 
              type="button"
              onclick={nextStep}
              disabled={!canProceedToNext()}
              class="flex items-center"
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
              class="flex items-center"
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
      </form>
    {/if}
  </div>
</div>