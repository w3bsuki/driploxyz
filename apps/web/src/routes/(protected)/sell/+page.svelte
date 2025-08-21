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
  
  // Store uploaded images separately
  interface UploadedImage {
    url: string;
    path: string;
  }
  let uploadedImages = $state<UploadedImage[]>([]);
  
  // Initialize Supabase client
  const supabase = createBrowserSupabaseClient();
  
  // Current step in form
  let currentStep = $state(1);
  
  // Track which fields have been touched for validation
  let touched = $state({
    title: false,
    category_id: false,
    brand: false,
    size: false,
    condition: false,
    price: false,
    shipping_cost: false,
    photos: false
  });
  
  // Computed values for derived state
  const selectedCategory = $derived(
    data.categories?.find(cat => cat.id === formData.category_id)
  );
  
  const subcategories = $derived(
    selectedCategory?.subcategories || []
  );
  
  // Computed errors based on validation
  const errors = $derived({
    ...(() => {
      const errs: Record<string, string> = {};
      
      // Step 1 validation
      if (touched.title && formData.title) {
        if (formData.title.length < 3) {
          errs.title = 'Title must be at least 3 characters';
        } else if (formData.title.length > 50) {
          errs.title = 'Title must be less than 50 characters';
        }
      }
      
      if (touched.category_id && !formData.category_id) {
        errs.category_id = 'Please select a category';
      }
      
      if (touched.photos && uploadedImages.length === 0) {
        errs.photos = 'At least one photo is required';
      }
      
      // Step 2 validation
      if (touched.brand && !formData.brand) {
        errs.brand = 'Please select or enter a brand';
      }
      
      if (touched.size && !formData.size) {
        errs.size = 'Please select a size';
      }
      
      if (touched.condition && !formData.condition) {
        errs.condition = 'Please select a condition';
      }
      
      // Step 3 validation
      if (touched.price) {
        if (!formData.price || formData.price <= 0) {
          errs.price = 'Price must be greater than 0';
        } else if (formData.price > 10000) {
          errs.price = 'Price cannot exceed $10,000';
        }
      }
      
      if (touched.shipping_cost && formData.shipping_cost < 0) {
        errs.shipping_cost = 'Shipping cost cannot be negative';
      }
      
      return errs;
    })()
  });
  
  // Helper to show errors only for touched fields
  function showError(field: keyof typeof touched): boolean {
    return touched[field] && !!errors[field];
  }
  
  function handlePrev() {
    if (currentStep > 1) {
      currentStep--;
    }
  }
  
  function handleNext() {
    // Mark current step fields as touched
    if (currentStep === 1) {
      touched.title = true;
      touched.category_id = true;
      touched.photos = true;
    } else if (currentStep === 2) {
      touched.brand = true;
      touched.size = true;
      touched.condition = true;
    } else if (currentStep === 3) {
      touched.price = true;
      touched.shipping_cost = true;
    }
    
    // Check if can proceed
    if (canProceedToNext) {
      currentStep++;
    }
  }
  
  // Make this reactive using $derived so it updates when state changes
  const canProceedToNext = $derived(() => {
    console.log('[SELL] canProceedToNext check:', { 
      currentStep, 
      uploadedImagesCount: uploadedImages.length, 
      title: formData.title,
      titleLength: formData.title?.length,
      categoryId: formData.category_id,
      description: formData.description
    });
    
    switch(currentStep) {
      case 1: 
        const step1Valid = uploadedImages.length > 0 && 
               formData.title && 
               formData.title.length >= 3 && 
               formData.category_id;
        console.log('[SELL] Step 1 valid:', step1Valid);
        return step1Valid;
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
  });

  // Handle image upload to Supabase
  async function handleImageUpload(files: File[]): Promise<UploadedImage[]> {
    console.log('[SELL] handleImageUpload called with', files.length, 'files');
    console.log('[SELL] Current uploadedImages before upload:', $state.snapshot(uploadedImages).length);
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
      console.log('[SELL] Total images now:', $state.snapshot(uploadedImages).length);
      
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
    }
    return success;
  }
  
  // Validate and handle form submission
  function handleSubmit() {
    console.log('[SELL] handleSubmit called, uploadedImages:', $state.snapshot(uploadedImages));
    console.log('[SELL] uploadedImages.length:', uploadedImages.length);
    console.log('[SELL] currentStep:', currentStep);
    
    // Make sure we're on the review step
    if (currentStep !== 4) {
      console.log('[SELL] Not on review step, skipping submit');
      return false;
    }
    
    // Mark all fields as touched to show validation errors
    touched = {
      title: true,
      category_id: true,
      brand: true,
      size: true,
      condition: true,
      price: true,
      shipping_cost: true,
      photos: true
    };
    
    // Check if form is valid
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      console.log('[SELL] Form has validation errors:', errors);
      toasts.error('Please fix all errors before submitting');
      currentStep = 1; // Go back to first step with errors
      return false;
    }
    
    // Check if we have images
    if (uploadedImages.length === 0) {
      console.log('[SELL] No images uploaded');
      toasts.error('Please upload at least one image');
      currentStep = 1;
      return false;
    }
    
    console.log('[SELL] All validations passed, submitting form');
    return true;
  }
  
  // Price suggestion state
  let priceSuggestion = $state<{
    suggested: number | null;
    range: { min: number; max: number } | null;
    confidence: 'low' | 'medium' | 'high';
  } | null>(null);
  
  // Update price suggestions when relevant fields change
  async function updatePriceSuggestions() {
    if (formData.category_id && formData.condition) {
      try {
        const suggestions = await getPriceSuggestions({
          categoryId: formData.category_id,
          brand: formData.brand,
          condition: formData.condition,
          size: formData.size
        });
        priceSuggestion = suggestions;
      } catch (error) {
        console.error('Failed to get price suggestions:', error);
        priceSuggestion = null;
      }
    }
  }
  
  // Update price suggestions when relevant fields change
  $effect(() => {
    updatePriceSuggestions();
  });
  
  // Get size options based on selected category
  const sizeOptions = $derived(
    !selectedCategory ? SIZE_CATEGORIES.clothing :
    selectedCategory.name.toLowerCase().includes('shoe') || 
    selectedCategory.name.toLowerCase().includes('sneaker') || 
    selectedCategory.name.toLowerCase().includes('boot') ? SIZE_CATEGORIES.shoes :
    selectedCategory.name.toLowerCase().includes('kid') || 
    selectedCategory.name.toLowerCase().includes('baby') ? SIZE_CATEGORIES.kids :
    SIZE_CATEGORIES.clothing
  );
  
  const steps = [
    { id: 1, title: 'Photos & Details' },
    { id: 2, title: 'Product Info' },
    { id: 3, title: 'Price & Publish' },
    { id: 4, title: 'Review' }
  ];
  
  // Handle errors from form action
  $effect(() => {
    if (form?.errors) {
      // Map server errors to touched fields
      Object.keys(form.errors).forEach(key => {
        if (key in touched) {
          touched[key as keyof typeof touched] = true;
        }
      });
      
      // Go to first step with errors
      if (currentStep === 4) {
        currentStep = 1;
      }
    }
  });
</script>

<svelte:head>
  <title>Sell an Item - Driplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="h-screen flex flex-col bg-white">
  <!-- Mobile Header -->
  <div class="sticky top-0 z-20 bg-white border-b px-4 py-3">
    <div class="flex items-center justify-between">
      <button 
        onclick={() => goto('/')}
        class="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        aria-label="Go back"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>
      
      <h1 class="text-lg font-semibold">List an Item</h1>
      
      <button 
        class="p-2 -mr-2 text-gray-600 hover:text-gray-900"
        aria-label="Get help"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  </div>

  <div class="flex-1 overflow-hidden flex flex-col">
    {#if data.needsBrandSubscription}
      <!-- Brand subscription required message -->
      <div class="flex-1 flex items-center justify-center p-6">
        <div class="text-center max-w-md">
          <div class="mb-6">
            <svg class="w-20 h-20 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Brand Account Subscription Required</h2>
          <p class="text-gray-600 mb-6">
            To list products with a brand account, you need an active brand subscription. 
            Upgrade now to start selling your products.
          </p>
          
          <div class="space-y-3">
            <Button 
              variant="primary" 
              size="lg" 
              onclick={() => goto('/settings/subscription')}
              class="w-full"
            >
              Upgrade to Brand Plan
            </Button>
            
            <Button 
              variant="ghost" 
              onclick={() => goto('/settings/account')}
              class="w-full"
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
        use:enhance={({ cancel, formData }) => {
          const canSubmit = handleSubmit();
          if (!canSubmit || isUploadingImages) {
            cancel();
            return;
          }
          
          submitting = true;
          
          // Add data before submission
          formData.append('photo_urls', JSON.stringify(uploadedImages.map(img => img.url)));
          formData.append('photo_paths', JSON.stringify(uploadedImages.map(img => img.path)));
          formData.append('tags', JSON.stringify(formData.tags));
          
          return async ({ result }) => {
            submitting = false;
            
            // The server returns a redirect on success
            if (result.type === 'redirect') {
              const match = result.location?.match(/id=([^&]+)/);
              if (match) {
                await goto(`/sell/success?id=${match[1]}`);
              } else {
                await goto('/dashboard');
              }
            } else if (result.type === 'failure') {
              toasts.error(result.data?.errors?._form || 'Failed to create listing');
              currentStep = 1;
            }
          };
        }}
      >
        <!-- Progress Steps -->
        <div class="px-4 py-3 border-b bg-gray-50">
          <StepIndicator 
            {steps}
            current={currentStep}
            completed={currentStep - 1}
            variant="minimal"
          />
        </div>
        
        <!-- Form Content -->
        <div class="flex-1 overflow-hidden flex flex-col">
          {#if currentStep === 1}
            <!-- Step 1: Photos & Details -->
            <div class="h-[calc(100vh-120px)] p-3 sm:p-6 flex flex-col justify-between gap-3">
              <div class="space-y-3 overflow-y-auto">
                <!-- Image Upload -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1.5">
                    Photos <span class="text-red-500">*</span>
                  </label>
                  <ImageUploaderSupabase
                    maxImages={10}
                    images={uploadedImages}
                    onUpload={handleImageUpload}
                    onDelete={handleImageDelete}
                    uploading={isUploadingImages}
                    class="mb-2"
                  />
                  {#if showError('photos')}
                    <p class="text-sm text-red-600 mt-1">{errors.photos}</p>
                  {/if}
                </div>

                <!-- Title -->
                <div>
                  <Input
                    type="text"
                    label="Title"
                    placeholder="What are you selling?"
                    bind:value={formData.title}
                    error={showError('title') ? errors.title : ''}
                    required
                    maxlength={50}
                    onblur={() => touched.title = true}
                    name="title"
                  />
                </div>

                <!-- Category -->
                <div>
                  <Select
                    label="Category"
                    bind:value={formData.category_id}
                    error={showError('category_id') ? errors.category_id : ''}
                    required
                    onchange={() => {
                      touched.category_id = true;
                      formData.subcategory_id = '';
                    }}
                    name="category_id"
                  >
                    <option value="">Select a category</option>
                    {#each data.categories || [] as category}
                      <option value={category.id}>{category.name}</option>
                    {/each}
                  </Select>
                </div>

                <!-- Subcategory (if available) -->
                {#if subcategories.length > 0}
                  <div>
                    <Select
                      label="Subcategory"
                      bind:value={formData.subcategory_id}
                      name="subcategory_id"
                    >
                      <option value="">Select a subcategory (optional)</option>
                      {#each subcategories as subcategory}
                        <option value={subcategory.id}>{subcategory.name}</option>
                      {/each}
                    </Select>
                  </div>
                {/if}

                <!-- Description -->
                <div>
                  <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    bind:value={formData.description}
                    placeholder="Add details about condition, measurements, flaws..."
                    rows="3"
                    maxlength="500"
                    class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                  <p class="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
                </div>
              </div>
            </div>

          {:else if currentStep === 2}
            <!-- Step 2: Product Info -->
            <div class="h-[calc(100vh-120px)] p-3 sm:p-6 flex flex-col justify-between gap-3">
              <div class="space-y-3 overflow-y-auto">
                <!-- Brand -->
                <div>
                  <BrandSelector
                    bind:value={formData.brand}
                    brands={POPULAR_BRANDS}
                    label="Brand"
                    error={showError('brand') ? errors.brand : ''}
                    required
                    onchange={() => touched.brand = true}
                    name="brand"
                  />
                </div>

                <!-- Size -->
                <div>
                  <Select
                    label="Size"
                    bind:value={formData.size}
                    error={showError('size') ? errors.size : ''}
                    required
                    onchange={() => touched.size = true}
                    name="size"
                  >
                    <option value="">Select size</option>
                    {#each sizeOptions as size}
                      <option value={size.value}>{size.label}</option>
                    {/each}
                  </Select>
                </div>

                <!-- Condition -->
                <div>
                  <ConditionSelector
                    bind:value={formData.condition}
                    label="Condition"
                    error={showError('condition') ? errors.condition : ''}
                    required
                    name="condition"
                    onchange={() => touched.condition = true}
                  />
                </div>

                <!-- Color (optional) -->
                <div>
                  <Input
                    type="text"
                    label="Color (optional)"
                    placeholder="e.g., Black, Red, Multi"
                    bind:value={formData.color}
                    maxlength={30}
                    name="color"
                  />
                </div>

                <!-- Material (optional) -->
                <div>
                  <Input
                    type="text"
                    label="Material (optional)"
                    placeholder="e.g., Cotton, Leather, Polyester"
                    bind:value={formData.material}
                    maxlength={50}
                    name="material"
                  />
                </div>
              </div>
            </div>

          {:else if currentStep === 3}
            <!-- Step 3: Price & Publish -->
            <div class="h-[calc(100vh-120px)] p-3 sm:p-6 flex flex-col justify-between gap-3">
              <div class="space-y-3 overflow-y-auto">
                <!-- Price -->
                <div>
                  <PriceInput
                    bind:value={formData.price}
                    label="Price"
                    error={showError('price') ? errors.price : ''}
                    required
                    suggestion={priceSuggestion}
                    onchange={() => touched.price = true}
                    name="price"
                  />
                </div>

                <!-- Shipping Cost -->
                <div>
                  <PriceInput
                    bind:value={formData.shipping_cost}
                    label="Shipping Cost"
                    error={showError('shipping_cost') ? errors.shipping_cost : ''}
                    placeholder="0.00"
                    name="shipping_cost"
                    onchange={() => touched.shipping_cost = true}
                  />
                </div>

                <!-- Tags -->
                <div>
                  <TagInput
                    bind:tags={formData.tags}
                    label="Tags (optional)"
                    placeholder="Add tags for better discoverability"
                    maxTags={10}
                  />
                </div>

                <!-- Premium Boost -->
                {#if data.profile?.premium_boosts_remaining > 0}
                  <div class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <label class="flex items-start">
                      <input
                        type="checkbox"
                        bind:checked={formData.use_premium_boost}
                        name="use_premium_boost"
                        class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <div class="ml-3">
                        <span class="font-medium text-gray-900">Use Premium Boost</span>
                        <p class="text-sm text-gray-600 mt-0.5">
                          Get 7 days of increased visibility
                        </p>
                        <p class="text-xs text-purple-600 mt-1">
                          {data.profile.premium_boosts_remaining} boosts remaining
                        </p>
                      </div>
                    </label>
                  </div>
                {/if}
              </div>
            </div>

          {:else if currentStep === 4}
            <!-- Step 4: Review -->
            <div class="h-[calc(100vh-200px)] p-3 sm:p-6 overflow-y-auto">
              <div class="space-y-4">
                <h2 class="text-lg font-semibold">Review Your Listing</h2>
                
                <!-- Photos Preview -->
                <div>
                  <h3 class="text-sm font-medium text-gray-700 mb-2">Photos</h3>
                  <div class="grid grid-cols-3 gap-2">
                    {#each uploadedImages.slice(0, 3) as image}
                      <img 
                        src={image.url} 
                        alt="Product" 
                        class="aspect-square object-cover rounded-lg"
                      />
                    {/each}
                    {#if uploadedImages.length > 3}
                      <div class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <span class="text-gray-600 text-sm">+{uploadedImages.length - 3} more</span>
                      </div>
                    {/if}
                  </div>
                </div>

                <!-- Details -->
                <div class="space-y-2">
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-sm text-gray-600">Title</span>
                    <span class="text-sm font-medium">{formData.title}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-sm text-gray-600">Category</span>
                    <span class="text-sm font-medium">
                      {data.categories?.find(c => c.id === formData.category_id)?.name || 'N/A'}
                    </span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-sm text-gray-600">Brand</span>
                    <span class="text-sm font-medium">{formData.brand}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-sm text-gray-600">Size</span>
                    <span class="text-sm font-medium">{formData.size}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-sm text-gray-600">Condition</span>
                    <span class="text-sm font-medium capitalize">{formData.condition?.replace('-', ' ')}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-sm text-gray-600">Price</span>
                    <span class="text-sm font-medium">${formData.price.toFixed(2)}</span>
                  </div>
                  <div class="flex justify-between py-2 border-b">
                    <span class="text-sm text-gray-600">Shipping</span>
                    <span class="text-sm font-medium">${formData.shipping_cost.toFixed(2)}</span>
                  </div>
                  {#if formData.use_premium_boost}
                    <div class="flex justify-between py-2 border-b">
                      <span class="text-sm text-gray-600">Premium Boost</span>
                      <span class="text-sm font-medium text-purple-600">Active</span>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
          
          <!-- Fallback for old browsers - hidden select for condition -->
          {#if currentStep === 2}
            <div class="hidden">
              <label for="condition-fallback" class="sr-only">Condition (Fallback)</label>
              <select
                id="condition-fallback"
                name="condition"
                bind:value={formData.condition}
                class="sr-only"
              >
                <option value="">Select condition</option>
                <option value="new">New with tags</option>
                <option value="like-new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          {/if}
        </div>
        
        <!-- Bottom Navigation -->
        <div class="sticky bottom-0 bg-white border-t px-4 py-3">
          <div class="flex gap-3 max-w-lg mx-auto">
            {#if currentStep > 1}
              <Button
                type="button"
                variant="ghost"
                onclick={handlePrev}
                disabled={submitting}
                class="flex-1"
              >
                Back
              </Button>
            {/if}
            
            {#if currentStep < 4}
              <Button
                type="button"
                variant="primary"
                onclick={handleNext}
                disabled={!canProceedToNext || submitting}
                class="flex-1"
              >
                Next
              </Button>
            {:else}
              <Button
                type="submit"
                variant="primary"
                disabled={submitting || !canProceedToNext}
                class="flex-1"
              >
                {#if submitting}
                  Publishing...
                {:else}
                  Publish Item
                {/if}
              </Button>
            {/if}
          </div>
        </div>
      </form>
    {/if}
  </div>
</div>

<style>
  /* Hide scrollbar but keep functionality */
  .overflow-y-auto {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .overflow-y-auto::-webkit-scrollbar {
    display: none;
  }
</style>