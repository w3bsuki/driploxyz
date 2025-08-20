<script lang="ts">
  import { goto } from '$app/navigation';
  import { getPriceSuggestions } from '$lib/client/products';
  import { ProductSchema, POPULAR_BRANDS, SIZE_CATEGORIES } from '$lib/validation/product';
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { 
    Button, 
    Input, 
    Select,
    ImageUploaderSupabase,
    StepIndicator, 
    ConditionSelector,
    BrandSelector,
    PriceInput,
    TagInput,
    toasts
  } from '@repo/ui';
import { uploadImages, deleteImage } from '$lib/supabase/storage';
import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import Header from '$lib/components/Header.svelte';

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
  
  // Form state using runes
  let formData = $state({
    title: form?.values?.title || '',
    description: form?.values?.description || '',
    category_id: form?.values?.category_id || '',
    subcategory_id: form?.values?.subcategory_id || '',
    brand: form?.values?.brand || '',
    size: form?.values?.size || '',
    condition: (form?.values?.condition as any) || 'good' as const,
    color: form?.values?.color || '',
    material: form?.values?.material || '',
    price: form?.values?.price || 0,
    shipping_cost: form?.values?.shipping_cost || 0,
    tags: form?.values?.tags || [] as string[],
    use_premium_boost: form?.values?.use_premium_boost || false
  });
  
  let submitting = $state(false);
  
  // Track if user is currently uploading images to prevent form submission
  let isUploadingImages = $state(false);
  
  // Track which fields have been touched by user
  let touched = $state({
    title: false,
    category_id: false,
    brand: false,
    size: false,
    condition: false,
    price: false,
    shipping_cost: false,
    photos: false,
    tags: false
  });
  
  // Track if user has attempted to submit or move to next step
  let hasAttemptedSubmit = $state(false);
  
  // Use errors from form ActionData
  const errors = $derived(form?.errors || {});
  
  // Real-time validation errors
  const validationErrors = $derived(() => {
    const errors: Record<string, string> = {};
    
    if (touched.title && formData.title) {
      if (formData.title.length < 3) {
        errors.title = 'Title must be at least 3 characters';
      }
    }
    
    if (touched.price && formData.price !== null && formData.price !== undefined) {
      if (formData.price <= 0) {
        errors.price = 'Price must be greater than 0';
      }
    }
    
    if (touched.photos && uploadedImages.length === 0) {
      errors.photos = 'At least one photo is required';
    }
    
    return errors;
  });

  // Only show errors if field has been touched and user has attempted submission
  const showError = (field: keyof typeof touched) => {
    return (hasAttemptedSubmit && touched[field] && errors[field]) || 
           (touched[field] && validationErrors()[field]);
  };
  let priceSuggestion = $state<{
    suggested: number | null;
    range: { min: number; max: number } | null;
    confidence: 'low' | 'medium' | 'high';
  } | null>(null);
  
  // Use regular form submission to server action

  // Multi-step form state
  let currentStep = $state(1);
  const totalSteps = 4;
  let isReviewing = $state(false);
  
  // File handling for photos
  interface UploadedImage {
    url: string;
    path: string;
  }
  let uploadedImages = $state<UploadedImage[]>([]);
  const supabase = createBrowserSupabaseClient();
  
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
    if (uploadedImages.length > 0 && formData.title && formData.category_id) {
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
    // Mark current step fields as touched and attempted
    hasAttemptedSubmit = true;
    markCurrentStepFieldsAsTouched();
    
    if (currentStep < totalSteps && canProceedToNext()) {
      currentStep++;
    }
  }
  
  // Mark current step fields as touched
  function markCurrentStepFieldsAsTouched() {
    switch(currentStep) {
      case 1:
        touched.title = true;
        touched.category_id = true;
        touched.photos = true;
        break;
      case 2:
        touched.brand = true;
        touched.size = true;
        touched.condition = true;
        break;
      case 3:
        touched.price = true;
        touched.shipping_cost = true;
        touched.tags = true;
        break;
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
        return uploadedImages.length > 0 && 
               formData.title && 
               formData.title.length >= 3 && 
               formData.category_id;
      case 2: 
        return formData.brand && formData.size && formData.condition;
      case 3: 
        return formData.price && formData.price > 0 && formData.shipping_cost >= 0;
      case 4:
        return uploadedImages.length > 0 && 
               formData.title && 
               formData.title.length >= 3 && 
               formData.category_id &&
               formData.brand && 
               formData.size && 
               formData.condition &&
               formData.price && 
               formData.price > 0;
      default: 
        return false;
    }
  }

  // Handle image upload to Supabase
  async function handleImageUpload(files: File[]): Promise<UploadedImage[]> {
    console.log('[SELL] handleImageUpload called with', files.length, 'files');
    console.log('[SELL] Current uploadedImages before upload:', uploadedImages.length);
    isUploadingImages = true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const uploaded = await uploadImages(supabase, files, 'product-images', user.id, (current, total) => {
        console.log(`Uploading ${current}/${total}`);
      });
      
      // UPDATE THE uploadedImages array!
      uploadedImages = [...uploadedImages, ...uploaded];
      console.log('[SELL] Images uploaded successfully:', uploaded.length, 'new images');
      console.log('[SELL] Total images now:', uploadedImages.length);
      
      touched.photos = true;
      return uploaded;
    } finally {
      isUploadingImages = false;
    }
  }
  
  // Handle image deletion from Supabase
  async function handleImageDelete(path: string): Promise<boolean> {
    const success = await deleteImage(supabase, path, 'product-images');
    if (success) {
      // Remove from uploadedImages array
      uploadedImages = uploadedImages.filter(img => img.path !== path);
      console.log('[SELL] Image deleted, remaining:', uploadedImages.length);
    }
    return success;
  }


  // Generate a temporary product ID for optimistic UI
  function generateTempId() {
    return 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Form submission handler - optimistic UI approach
  function handleSubmit() {
    console.log('[SELL] handleSubmit called, uploadedImages:', uploadedImages);
    console.log('[SELL] uploadedImages.length:', uploadedImages.length);
    console.log('[SELL] currentStep:', currentStep);
    
    // Prevent submission if currently uploading images
    if (isUploadingImages) {
      console.log('[SELL] Preventing submission - images are being uploaded');
      return false;
    }
    
    // Mark all fields as touched and attempted
    hasAttemptedSubmit = true;
    touched.title = true;
    touched.category_id = true;
    touched.brand = true;
    touched.size = true;
    touched.condition = true;
    touched.price = true;
    touched.shipping_cost = true;
    touched.photos = true;
    touched.tags = true;
    
    if (currentStep !== 4) {
      toasts.error('Please review your listing before publishing');
      return false;
    }
    
    if (uploadedImages.length === 0) {
      console.log('[SELL] ERROR: No uploaded images found!');
      toasts.error('At least one photo is required');
      return false;
    }
    
    console.log('[SELL] All validations passed - showing success page optimistically');
    
    // Generate temporary ID and navigate to success immediately
    const tempId = generateTempId();
    goto(`/sell/success?id=${tempId}&status=processing`);
    
    // Let the form submit in background
    return true;
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
  
  // Real-time validation happens through the showError derived function
  // Errors automatically hide when field becomes valid and has been touched
  
  // Note: Fields are marked as touched through user interactions, not automatic changes

  // Show toast error messages when form errors occur (but not during successful submissions)
  $effect(() => {
    if (errors._form && !submitting) {
      toasts.error(errors._form);
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

<div class="min-h-screen bg-gray-50 flex flex-col">
  <Header />
  

  <!-- Progress Indicator -->
  <div class="bg-white border-b shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-3">
      <!-- Mobile Step Indicator -->
      <div class="sm:hidden">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium text-gray-900">{steps[currentStep - 1].title}</span>
            <span class="text-xs text-gray-500">({currentStep}/{totalSteps})</span>
          </div>
          <div class="flex gap-1">
            {#each steps as step}
              <div 
                class="h-1.5 w-6 rounded-full transition-colors"
                class:bg-blue-500={step.id <= currentStep}
                class:bg-gray-200={step.id > currentStep}
              />
            {/each}
          </div>
        </div>
        <p class="text-xs text-gray-500">{steps[currentStep - 1].description}</p>
      </div>
      
      <!-- Desktop Step Indicator -->
      <div class="hidden sm:block">
        <StepIndicator 
          {steps} 
          {currentStep} 
          completedSteps={completedSteps()}
          onStepClick={goToStep}
        />
      </div>
    </div>
  </div>

  <!-- Form Content - Flex grow to take available space -->
  <div class="flex-1">
    <div class="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-20 sm:pb-6">
    <!-- Error Messages - Only show if user has attempted submission and there are visible errors -->
    {#if hasAttemptedSubmit}
      {@const visibleErrors = Object.entries(errors).filter(([field, message]) => 
        field !== '_form' && hasAttemptedSubmit && touched[field] && message
      )}
      {#if visibleErrors.length > 0}
        <div class="mb-4">
          <div class="bg-red-50 text-red-600 p-4 rounded-lg flex items-start space-x-3">
            <svg class="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <p class="text-red-800 font-medium">Please fix the following errors:</p>
            <ul class="mt-1 text-sm list-disc list-inside">
              {#each visibleErrors as [field, message]}
                <li>{message}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
      {/if}
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
      <form 
        method="POST"
        enctype="multipart/form-data"
        class="h-full flex flex-col"
        use:enhance={({ submitter, cancel }) => {
          console.log('[SELL] Form submission triggered', { submitter: submitter?.type, isUploading: isUploadingImages });
          
          // Only allow actual submit button clicks, not other form events
          if (!submitter || submitter.type !== 'submit') {
            console.log('[SELL] Form submission prevented - not from submit button');
            cancel();
            return;
          }
          
          // Prevent submission if currently uploading images
          if (isUploadingImages) {
            console.log('[SELL] Form submission prevented - uploading images');
            cancel();
            return;
          }
          
          const canSubmit = handleSubmit();
          if (!canSubmit) {
            console.log('[SELL] Form submission prevented - validation failed');
            cancel();
            return;
          }
          
          submitting = true;
          
          return async ({ update, formData: serverFormData, result }) => {
            // Add photo URLs and paths to FormData
            serverFormData.append('photo_urls', JSON.stringify(uploadedImages.map(img => img.url)));
            serverFormData.append('photo_paths', JSON.stringify(uploadedImages.map(img => img.path)));
            // Add tags as JSON string
            serverFormData.append('tags', JSON.stringify(formData.tags));
            
            console.log('[SELL] Form result type:', result.type);
            
            // Handle successful submissions
            if (result.type === 'success' && result.data?.success && result.data?.productId) {
              console.log('[SELL] Form submission successful, navigating to success page');
              submitting = false;
              goto(`/sell/success?id=${result.data.productId}`);
              return;
            }
            
            // Handle successful redirects (fallback)
            if (result.type === 'redirect') {
              console.log('[SELL] Successful redirect to:', result.location);
              submitting = false;
              return;
            }
            
            // Handle errors
            if (result.type === 'failure') {
              console.log('[SELL] Form submission failed:', result.data);
              submitting = false;
              await update();
              return;
            }
            
            // Default handling
            submitting = false;
            await update();
          };
        }}
      >
        <div class="bg-white rounded-lg shadow-sm flex-1 flex flex-col">
          <!-- Form-level errors -->
          {#if errors._form}
            <div class="p-6 pb-0">
              <div class="bg-red-50 border border-red-200 rounded-md p-4">
                <div class="flex">
                  <div class="shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <p class="text-sm text-red-800">{errors._form}</p>
                  </div>
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Step Content Container - Viewport optimized -->
          <div class="flex-1">
            {#if currentStep === 1}
              <!-- Step 1: Photos & Details -->
              <div class="h-[calc(100vh-200px)] p-3 sm:p-6 flex flex-col gap-3">
              <!-- Image Upload -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Photos <span class="text-red-500">*</span>
                </label>
                <ImageUploaderSupabase
                  bind:images={uploadedImages}
                  bind:uploading={isUploadingImages}
                  onUpload={handleImageUpload}
                  onDelete={handleImageDelete}
                  maxImages={10}
                  error={showError('photos') ? errors.photos : undefined}
                  helpText="Add up to 10 photos. First photo will be the cover image."
                />
              </div>

              <!-- Title & Category Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Title -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Title <span class="text-red-500">*</span>
                  </label>
                  <input
                    bind:value={formData.title}
                    type="text"
                    placeholder="e.g. Vintage Levi's Denim Jacket"
                    class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1
                      {showError('title') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                    maxlength="50"
                    oninput={() => touched.title = true}
                  />
                  {#if showError('title')}
                    <p class="mt-1 text-sm text-red-600">{errors.title || validationErrors().title}</p>
                  {/if}
                </div>

                <!-- Category -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span class="text-red-500">*</span>
                  </label>
                  <select
                    bind:value={formData.category_id}
                    class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1
                      {showError('category_id') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                    onchange={() => touched.category_id = true}
                  >
                    <option value="">Select category</option>
                    {#each mainCategories as category}
                      <option value={category.id}>{category.name}</option>
                    {/each}
                  </select>
                  {#if showError('category_id')}
                    <p class="mt-1 text-sm text-red-600">{errors.category_id}</p>
                  {/if}
                </div>
              </div>

              <!-- Subcategory (if available) -->
              {#if formData.category_id}
                {@const subcategories = getSubcategories(formData.category_id)}
                {#if subcategories.length > 0}
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                      Subcategory
                    </label>
                    <select
                      bind:value={formData.subcategory_id}
                      class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select subcategory</option>
                      {#each subcategories as subcategory}
                        <option value={subcategory.id}>{subcategory.name}</option>
                      {/each}
                    </select>
                  </div>
                {/if}
              {/if}

              <!-- Description (Compact) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  bind:value={formData.description}
                  rows="2"
                  placeholder="Describe your item, including any flaws..."
                  class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  maxlength="500"
                ></textarea>
              </div>
              </div>

            {:else if currentStep === 2}
              <!-- Step 2: Product Info -->
              <div class="h-[calc(100vh-200px)] p-3 sm:p-6 flex flex-col gap-3">
              <!-- Brand -->
              <div>
                <BrandSelector
                  bind:value={formData.brand}
                  popularBrands={POPULAR_BRANDS}
                  label="Brand"
                  error={showError('brand') ? errors.brand : undefined}
                  required
                />
              </div>

              <!-- Size & Condition Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Size -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Size <span class="text-red-500">*</span>
                  </label>
                  <select
                    bind:value={formData.size}
                    class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1
                      {showError('size') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                    onchange={() => touched.size = true}
                  >
                    <option value="">Select size</option>
                    {#each SIZE_CATEGORIES.clothing as size}
                      <option value={size.value}>{size.label}</option>
                    {/each}
                  </select>
                  {#if showError('size')}
                    <p class="mt-1 text-sm text-red-600">{errors.size}</p>
                  {/if}
                </div>

                <!-- Condition Compact -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Condition <span class="text-red-500">*</span>
                  </label>
                  <select
                    bind:value={formData.condition}
                    class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1
                      {showError('condition') 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}"
                    onchange={() => touched.condition = true}
                  >
                    <option value="">Select condition</option>
                    <option value="new">New with tags</option>
                    <option value="like_new">Like new</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                  {#if showError('condition')}
                    <p class="mt-1 text-sm text-red-600">{errors.condition}</p>
                  {/if}
                </div>
              </div>

              <!-- Color & Material Row -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Color
                  </label>
                  <input
                    bind:value={formData.color}
                    type="text"
                    placeholder="e.g. Blue, Red"
                    class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    maxlength="30"
                  />
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Material
                  </label>
                  <input
                    bind:value={formData.material}
                    type="text"
                    placeholder="e.g. Cotton"
                    class="w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    maxlength="50"
                  />
                </div>
              </div>
              </div>

            {:else if currentStep === 3}
              <!-- Step 3: Price & Publish -->
              <div class="h-[calc(100vh-200px)] p-3 sm:p-6 flex flex-col gap-3">
              <!-- Price & Shipping Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <!-- Price -->
                <div>
                  <PriceInput
                    bind:value={formData.price}
                    label="Price"
                    error={showError('price') ? errors.price : undefined}
                    required
                    showCalculation={true}
                    feePercentage={5}
                    helpText="Set competitive price"
                    oninput={() => touched.price = true}
                  />
                </div>

                <!-- Shipping Price -->
                <div>
                  <PriceInput
                    bind:value={formData.shipping_cost}
                    label="Shipping Cost"
                    error={showError('shipping_cost') ? errors.shipping_cost : undefined}
                    required
                    helpText="Set to 0 for free shipping"
                  />
                </div>
              </div>
                
                <!-- Price Suggestions -->
                {#if priceSuggestion && priceSuggestion.suggested}
                  <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
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

              <!-- Tags -->
              <div>
                <TagInput
                  bind:tags={formData.tags}
                  label="Tags"
                  placeholder="Add tags to help buyers find your item"
                  suggestions={tagSuggestions}
                  error={showError('tags') ? errors.tags : undefined}
                  helpText="Add relevant keywords"
                />
              </div>

              <!-- Premium Boost -->
              {#if data.profile?.subscription_tier === 'premium' && data.profile?.premium_boosts_remaining > 0}
                <div class="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
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
              {/if}
              </div>
            {:else if currentStep === 4}
              <!-- Step 4: Review & Publish -->
              <div class="h-[calc(100vh-200px)] p-3 sm:p-6 flex flex-col gap-3 overflow-y-auto">
              <h2 class="text-lg font-semibold text-gray-900">Review Your Listing</h2>
              
              <!-- Photos Preview -->
              <div>
                <h3 class="text-sm font-medium text-gray-700 mb-2">Photos</h3>
                <div class="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {#each uploadedImages as image, index}
                    <div class="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={image.url} alt="Product {index + 1}" class="w-full h-full object-cover" />
                    </div>
                  {/each}
                </div>
              </div>
              
              <!-- Product Details -->
              <div class="space-y-3 border-t pt-3">
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-xs text-gray-500">Title</span>
                    <p class="font-medium text-gray-900 truncate">{formData.title}</p>
                  </div>
                  
                  <div>
                    <span class="text-xs text-gray-500">Category</span>
                    <p class="font-medium text-gray-900 truncate">
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
                    <p class="text-sm text-gray-700 mt-1 line-clamp-3">{formData.description}</p>
                  </div>
                {/if}
                
                <!-- Pricing Compact -->
                <div class="border-t pt-3">
                  <div class="space-y-1 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Item Price</span>
                      <span class="font-medium">${Number(formData.price || 0).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Shipping</span>
                      <span class="font-medium">
                        {Number(formData.shipping_cost) > 0 ? `$${Number(formData.shipping_cost).toFixed(2)}` : 'Free'}
                      </span>
                    </div>
                    <div class="flex justify-between border-t pt-1">
                      <span class="font-medium text-gray-900">Buyer Pays</span>
                      <span class="text-lg font-bold text-gray-900">
                        ${(Number(formData.price || 0) + Number(formData.shipping_cost || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs text-gray-500">You receive (after 5% fee)</span>
                      <span class="text-sm font-medium text-green-600">
                        ${(Number(formData.price || 0) * 0.95).toFixed(2)}
                      </span>
                    </div>
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
                  <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-lg">✨</span>
                      <span class="text-sm font-medium text-gray-900">Premium Boost Applied</span>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">3x more visibility for 7 days</p>
                  </div>
                {/if}
              </div>
              
              <!-- Terms Notice -->
              <div class="p-3 bg-blue-50 rounded-lg">
                <p class="text-xs text-blue-800">
                  By publishing, you agree to our terms of service and confirm that this item is authentic and accurately described.
                </p>
              </div>
              </div>
            {/if}
          </div>
        </div>
        
        <!-- Navigation Buttons - Fixed Bottom Sheet on Mobile -->
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 sm:relative sm:bottom-auto sm:left-auto sm:right-auto sm:bg-transparent sm:border-0 sm:shadow-none sm:z-auto sm:mt-6">
          <div class="max-w-4xl mx-auto px-4 py-3 sm:px-0 sm:py-0">
            <div class="flex gap-2">
              {#if currentStep > 1}
                <Button 
                  type="button"
                  onclick={prevStep}
                  variant="outline"
                  class="sm:flex-none h-12 text-sm font-medium px-4"
                >
                  <svg class="w-4 h-4 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
              {/if}
              
              {#if currentStep < totalSteps}
                <Button 
                  type="button"
                  onclick={nextStep}
                  disabled={!canProceedToNext()}
                  class="flex-1 sm:flex-none h-12 text-sm font-medium px-6"
                >
                  Continue
                  <svg class="w-4 h-4 ml-1 sm:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              {:else}
                <Button 
                  type="submit"
                  disabled={submitting || !canProceedToNext()}
                  class="flex-1 sm:flex-none h-12 text-sm font-medium px-6"
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
        
        <!-- Hidden form inputs -->
        <input type="hidden" name="title" bind:value={formData.title} />
        <input type="hidden" name="description" bind:value={formData.description} />
        <input type="hidden" name="category_id" bind:value={formData.category_id} />
        <input type="hidden" name="subcategory_id" bind:value={formData.subcategory_id} />
        <input type="hidden" name="brand" bind:value={formData.brand} />
        <input type="hidden" name="size" bind:value={formData.size} />
        <input type="hidden" name="condition" bind:value={formData.condition} />
        <input type="hidden" name="color" bind:value={formData.color} />
        <input type="hidden" name="material" bind:value={formData.material} />
        <input type="hidden" name="price" bind:value={formData.price} />
        <input type="hidden" name="shipping_cost" bind:value={formData.shipping_cost} />
        <input type="hidden" name="use_premium_boost" bind:value={formData.use_premium_boost} />
        <input type="hidden" name="tags" value={JSON.stringify(formData.tags)} />
        <input type="hidden" name="photo_urls" value={JSON.stringify(uploadedImages.map(img => img.url))} />
        <input type="hidden" name="photo_paths" value={JSON.stringify(uploadedImages.map(img => img.path))} />
      </form>
    {/if}
    </div>
  </div>
</div>