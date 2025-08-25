<script lang="ts">
  import { goto } from '$app/navigation';
  import { enhance } from '$app/forms';
  import { getPriceSuggestions } from '$lib/client/products';
  import { SIZE_CATEGORIES, ProductCondition } from '$lib/validation/product';
  import { uploadImages, deleteImage } from '$lib/supabase/storage';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { Button, ImageUploaderSupabase, Input, Select, PriceInput, TagInput, toasts } from '@repo/ui';
  import type { PageData, ActionData } from './$types';

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();

  // Form state using Svelte 5 runes
  let currentStep = $state(1);
  let submitting = $state(false);
  let isUploadingImages = $state(false);
  let formElement: HTMLFormElement;

  interface FormData {
    title: string;
    description: string;
    gender_category_id: string;
    type_category_id: string;
    category_id: string;
    brand: string;
    size: string;
    condition: 'new' | 'like-new' | 'good' | 'fair';
    color: string;
    material: string;
    price: number;
    shipping_cost: number;
    tags: string[];
    use_premium_boost: boolean;
  }

  let formData = $state<FormData>({
    title: form?.values?.title || '',
    description: form?.values?.description || '',
    gender_category_id: form?.values?.gender_category_id || '',
    type_category_id: form?.values?.type_category_id || '',
    category_id: form?.values?.category_id || '',
    brand: form?.values?.brand || '',
    size: form?.values?.size || '',
    condition: (form?.values?.condition as FormData['condition']) || 'good',
    color: form?.values?.color || '',
    material: form?.values?.material || '',
    price: form?.values?.price || 0,
    shipping_cost: form?.values?.shipping_cost || 0,
    tags: form?.values?.tags || [],
    use_premium_boost: form?.values?.use_premium_boost || false
  });

  interface UploadedImage {
    url: string;
    path: string;
  }

  let uploadedImages = $state<UploadedImage[]>([]);
  let publishError = $state<string | null>(null);
  let showSuccess = $state(false);

  const supabase = createBrowserSupabaseClient();

  // Derived category options
  const genderCategories = $derived(
    data.categories?.filter(cat => !cat.parent_id) || []
  );

  const typeCategories = $derived(
    formData.gender_category_id 
      ? data.categories?.filter(cat => cat.parent_id === formData.gender_category_id) || []
      : []
  );

  const specificCategories = $derived(
    formData.type_category_id
      ? data.categories?.filter(cat => cat.parent_id === formData.type_category_id) || []
      : []
  );

  // Size options based on selected category
  const selectedCategoryData = $derived(
    formData.category_id ? data.categories?.find(c => c.id === formData.category_id) : null
  );

  const sizeOptions = $derived(
    !selectedCategoryData ? SIZE_CATEGORIES.clothing :
    selectedCategoryData.name.toLowerCase().includes('shoe') || 
    selectedCategoryData.name.toLowerCase().includes('sneaker') || 
    selectedCategoryData.name.toLowerCase().includes('boot') ? SIZE_CATEGORIES.shoes :
    selectedCategoryData.name.toLowerCase().includes('kid') || 
    selectedCategoryData.name.toLowerCase().includes('baby') ? SIZE_CATEGORIES.kids :
    SIZE_CATEGORIES.clothing
  );

  // Price suggestions
  let priceSuggestion = $state<{
    suggested: number | null;
    range: { min: number; max: number } | null;
    confidence: 'low' | 'medium' | 'high';
  } | null>(null);

  // Update price suggestions when relevant fields change
  $effect(() => {
    if (formData.category_id && formData.condition) {
      getPriceSuggestions({
        categoryId: formData.category_id,
        brand: formData.brand,
        condition: formData.condition,
        size: formData.size
      }).then(suggestions => {
        priceSuggestion = suggestions;
      }).catch(() => {
        priceSuggestion = null;
      });
    }
  });

  // Validation for each step
  const canProceedStep1 = $derived(
    uploadedImages.length > 0 &&
    formData.title.length >= 3 &&
    formData.gender_category_id &&
    formData.type_category_id &&
    (specificCategories.length === 0 || formData.category_id) &&
    formData.condition &&
    formData.brand &&
    formData.size
  );

  const canProceedStep2 = $derived(formData.price > 0);

  const canSubmit = $derived(
    canProceedStep1 && canProceedStep2 && uploadedImages.length > 0
  );

  // Image upload handlers
  async function handleImageUpload(files: File[]): Promise<UploadedImage[]> {
    // Check file size first
    const tooLargeFiles = files.filter(f => f.size > 10 * 1024 * 1024); // 10MB limit
    if (tooLargeFiles.length > 0) {
      const fileNames = tooLargeFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(1)} MB)`);
      toasts.error(`Images too large: ${fileNames.join(', ')}. Max 10MB per image.`);
      return [];
    }

    if (!data.user) {
      toasts.error('User not authenticated - please refresh the page');
      return [];
    }

    isUploadingImages = true;

    try {
      const uploaded = await uploadImages(
        supabase, 
        files, 
        'product-images', 
        data.user.id,
        (current, total) => {
          // Progress updates handled internally
        }
      );

      return uploaded;
    } catch (error) {
      let errorMessage = 'Failed to upload images';
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          errorMessage = 'Upload timed out. Please try again.';
        } else if (error.message.includes('egress') || error.message.includes('bandwidth')) {
          errorMessage = 'Storage bandwidth limit reached. Please try again later.';
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = `Upload failed: ${error.message}`;
        }
      }

      toasts.error(errorMessage);
      return [];
    } finally {
      isUploadingImages = false;
    }
  }

  async function handleImageDelete(path: string): Promise<boolean> {
    const success = await deleteImage(supabase, path, 'product-images');
    if (success) {
      uploadedImages = uploadedImages.filter(img => img.path !== path);
    }
    return success;
  }

  // Reset category selections when parent changes
  function handleGenderCategoryChange() {
    formData.type_category_id = '';
    formData.category_id = '';
  }

  function handleTypeCategoryChange() {
    formData.category_id = '';
  }

  // Condition options
  const conditions = [
    { value: 'new' as const, label: 'New with tags', shortLabel: 'New' },
    { value: 'like-new' as const, label: 'Like new', shortLabel: 'Like new' },
    { value: 'good' as const, label: 'Good', shortLabel: 'Good' },
    { value: 'fair' as const, label: 'Fair', shortLabel: 'Fair' }
  ];
</script>

<svelte:head>
  <title>List an Item • Driplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
    <div class="px-4 py-3">
      <div class="flex items-center justify-between">
        <button 
          onclick={() => goto('/dashboard')}
          class="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
          aria-label="Go back"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div class="text-center">
          <h1 class="text-base font-semibold text-gray-900">List an Item</h1>
          <p class="text-xs text-gray-500 mt-0.5">Step {currentStep} of 3</p>
        </div>
        
        <button 
          onclick={() => goto('/dashboard')}
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <div class="h-1 bg-gray-100">
      <div 
        class="h-full bg-blue-500 transition-all duration-500 ease-out"
        style="width: {(currentStep / 3) * 100}%"
      />
    </div>
  </header>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto pb-24">
    <div class="max-w-lg mx-auto px-4 py-6">
      {#if data.needsBrandSubscription}
        <!-- Brand subscription required -->
        <div class="text-center py-12">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <h2 class="text-xl font-bold text-gray-900 mb-2">Upgrade to Sell</h2>
          <p class="text-gray-600 mb-6">
            Brand accounts need an active subscription to list products.
          </p>
          
          <Button 
            variant="primary" 
            onclick={() => goto('/settings/subscription')}
            class="w-full max-w-xs"
          >
            Upgrade Now
          </Button>
        </div>
      {:else}
        <!-- Multi-step Form -->
        <form 
          method="POST"
          bind:this={formElement}
          use:enhance={({ formData: formDataObj }) => {
            submitting = true;
            publishError = null;

            // Add all form data
            Object.entries(formData).forEach(([key, value]) => {
              if (key === 'tags') {
                formDataObj.append(key, JSON.stringify(value));
              } else if (typeof value === 'boolean' || typeof value === 'number') {
                formDataObj.append(key, value.toString());
              } else {
                formDataObj.append(key, value as string);
              }
            });

            formDataObj.append('photo_urls', JSON.stringify(uploadedImages.map(img => img.url)));
            formDataObj.append('photo_paths', JSON.stringify(uploadedImages.map(img => img.path)));

            return async ({ result, update }) => {
              submitting = false;

              if (result.type === 'failure') {
                const errorMessage = result.data?.errors?._form || 'Failed to create listing';
                publishError = errorMessage;
                toasts.error(errorMessage);
              } else if (result.type === 'success' && result.data?.success) {
                showSuccess = true;
                toasts.success('Listing published successfully!');

                const productId = result.data.productId;

                setTimeout(() => {
                  if (productId) {
                    goto(`/product/${productId}`);
                  } else {
                    goto('/');
                  }
                }, 1500);
              }

              await update();
            };
          }}
        >
          <!-- Step 1: Photos and Basic Details -->
          {#if currentStep === 1}
            <div class="space-y-6">
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-1">Add Photos & Details</h2>
                <p class="text-sm text-gray-600">High-quality photos help your item sell faster</p>
              </div>

              <!-- Image Upload -->
              <div>
                <ImageUploaderSupabase
                  maxImages={10}
                  bind:images={uploadedImages}
                  onUpload={handleImageUpload}
                  onDelete={handleImageDelete}
                  bind:uploading={isUploadingImages}
                />
                {#if uploadedImages.length === 0}
                  <p class="text-xs text-red-600 mt-2">At least one photo is required</p>
                {:else}
                  <p class="text-xs text-green-600 mt-2">{uploadedImages.length} photo{uploadedImages.length === 1 ? '' : 's'} uploaded</p>
                {/if}
              </div>

              <!-- Item Title -->
              <Input
                type="text"
                label="What are you selling?"
                placeholder="e.g., Nike Air Max 90 Sneakers"
                bind:value={formData.title}
                maxlength={50}
                name="title"
                required
              />

              <!-- Categories -->
              <div class="space-y-4">
                <h3 class="font-medium text-gray-900">Category</h3>
                
                <Select
                  label="Who is this for?"
                  bind:value={formData.gender_category_id}
                  onchange={handleGenderCategoryChange}
                  name="gender_category_id"
                  required
                >
                  <option value="">Choose category</option>
                  {#each genderCategories as category}
                    <option value={category.id}>{category.name}</option>
                  {/each}
                </Select>

                {#if typeCategories.length > 0}
                  <Select
                    label="Type"
                    bind:value={formData.type_category_id}
                    onchange={handleTypeCategoryChange}
                    name="type_category_id"
                    required
                  >
                    <option value="">Choose type</option>
                    {#each typeCategories as category}
                      <option value={category.id}>{category.name}</option>
                    {/each}
                  </Select>
                {/if}

                {#if specificCategories.length > 0}
                  <Select
                    label="Specific category"
                    bind:value={formData.category_id}
                    name="category_id"
                    required
                  >
                    <option value="">Choose specific category</option>
                    {#each specificCategories as category}
                      <option value={category.id}>{category.name}</option>
                    {/each}
                  </Select>
                {/if}
              </div>

              <!-- Brand and Size -->
              <div class="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Brand"
                  placeholder="e.g., Nike"
                  bind:value={formData.brand}
                  name="brand"
                  required
                />

                <Select
                  label="Size"
                  bind:value={formData.size}
                  name="size"
                  required
                >
                  <option value="">Choose size</option>
                  {#each sizeOptions as size}
                    <option value={size.value}>{size.label}</option>
                  {/each}
                </Select>
              </div>

              <!-- Condition -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-3">
                  Condition <span class="text-red-500">*</span>
                </label>
                <div class="grid grid-cols-2 gap-3">
                  {#each conditions as condition}
                    <button
                      type="button"
                      onclick={() => formData.condition = condition.value}
                      class="px-4 py-3 text-sm font-medium rounded-lg border-2 transition-all text-left
                        {formData.condition === condition.value 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : 'border-gray-200 bg-white hover:border-gray-300'}"
                    >
                      <div class="font-semibold">{condition.shortLabel}</div>
                      <div class="text-xs opacity-75 hidden sm:block">{condition.label}</div>
                    </button>
                  {/each}
                </div>
              </div>
            </div>
          {/if}

          <!-- Step 2: Additional Details -->
          {#if currentStep === 2}
            <div class="space-y-6">
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-1">Additional Details</h2>
                <p class="text-sm text-gray-600">Help buyers find exactly what they're looking for</p>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <Input
                  type="text"
                  label="Color (optional)"
                  placeholder="e.g., Black, Red"
                  bind:value={formData.color}
                  maxlength={30}
                  name="color"
                />

                <Input
                  type="text"
                  label="Material (optional)"
                  placeholder="e.g., Cotton, Leather"
                  bind:value={formData.material}
                  maxlength={50}
                  name="material"
                />
              </div>

              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  bind:value={formData.description}
                  placeholder="Describe the condition, measurements, or any flaws..."
                  rows="4"
                  maxlength="500"
                  class="w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                ></textarea>
                <p class="text-xs text-gray-500 mt-2">{formData.description.length}/500 characters</p>
              </div>
            </div>
          {/if}

          <!-- Step 3: Pricing and Publish -->
          {#if currentStep === 3}
            <div class="space-y-6">
              <div>
                <h2 class="text-xl font-bold text-gray-900 mb-1">Set Your Price</h2>
                <p class="text-sm text-gray-600">Price competitively to sell faster</p>
              </div>

              <PriceInput
                bind:value={formData.price}
                label="Price"
                suggestion={priceSuggestion}
                name="price"
                required
                showCalculation={true}
                feePercentage={5}
              />

              <PriceInput
                bind:value={formData.shipping_cost}
                label="Shipping Cost (optional)"
                placeholder="0.00"
                name="shipping_cost"
              />

              <TagInput
                bind:tags={formData.tags}
                label="Tags (optional)"
                placeholder="Add keywords to help buyers find your item"
                maxTags={10}
              />

              {#if data.profile?.premium_boosts_remaining && data.profile.premium_boosts_remaining > 0}
                <div class="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <label class="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      bind:checked={formData.use_premium_boost}
                      name="use_premium_boost"
                      class="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <div class="ml-3">
                      <span class="font-medium text-gray-900">Use Premium Boost</span>
                      <p class="text-sm text-gray-600 mt-1">
                        Get 7 days of increased visibility to sell faster
                      </p>
                      <p class="text-xs text-purple-600 mt-1">
                        {data.profile.premium_boosts_remaining} boosts remaining
                      </p>
                    </div>
                  </label>
                </div>
              {/if}

              <!-- Review Card -->
              {#if uploadedImages[0]}
                <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <img 
                    src={uploadedImages[0].url} 
                    alt={formData.title}
                    class="w-full h-48 object-cover"
                  />
                  <div class="p-4 space-y-3">
                    <h3 class="font-semibold text-lg">{formData.title}</h3>
                    <div class="flex items-center justify-between">
                      <span class="text-2xl font-bold text-green-600">${formData.price}</span>
                      {#if formData.shipping_cost > 0}
                        <span class="text-sm text-gray-500">+ ${formData.shipping_cost} shipping</span>
                      {/if}
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">{formData.brand}</span>
                      <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">Size {formData.size}</span>
                      <span class="px-2 py-1 bg-gray-100 text-xs rounded-full capitalize">{formData.condition.replace('-', ' ')}</span>
                    </div>
                  </div>
                </div>
              {/if}

              {#if publishError}
                <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p class="text-sm text-red-600">{publishError}</p>
                </div>
              {/if}
            </div>
          {/if}
        </form>
      {/if}
    </div>
  </div>

  <!-- Navigation Footer -->
  {#if !data.needsBrandSubscription && !showSuccess}
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-40">
      <div class="max-w-lg mx-auto flex gap-3">
        {#if currentStep > 1}
          <Button
            type="button"
            variant="ghost"
            onclick={() => {
              currentStep--;
              publishError = null;
            }}
            disabled={submitting}
            class="flex-1 h-12"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Button>
        {/if}

        {#if currentStep < 3}
          <Button
            type="button"
            variant="primary"
            onclick={() => {
              currentStep++;
              publishError = null;
            }}
            disabled={
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2)
            }
            class="flex-1 h-12"
          >
            Continue
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        {:else}
          <Button
            type="button"
            variant="primary"
            onclick={() => {
              publishError = null;
              if (formElement) {
                formElement.requestSubmit();
              }
            }}
            disabled={submitting || !canSubmit}
            class="flex-1 h-12"
          >
            {#if submitting}
              <svg class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
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
  {/if}

  <!-- Success Modal -->
  {#if showSuccess}
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">Item Listed Successfully!</h3>
        <p class="text-gray-600">Your item is now live and ready for buyers to discover</p>
      </div>
    </div>
  {/if}
</div>