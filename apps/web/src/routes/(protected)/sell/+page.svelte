<script lang="ts">
  import { goto } from '$app/navigation';
  import { getPriceSuggestions } from '$lib/client/products';
  import { SIZE_CATEGORIES } from '$lib/validation/product';
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { Button, toasts } from '@repo/ui';
  import { uploadImages, deleteImage } from '$lib/supabase/storage';
  import StepPhotosAndBasicInfo from './components/StepPhotosAndBasicInfo.svelte';
  import StepProductInfo from './components/StepProductInfo.svelte';
  import StepPricing from './components/StepPricing.svelte';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { onMount } from 'svelte';

  interface Props {
    data: PageData;
    form: ActionData;
  }

  let { data, form }: Props = $props();
  
  // Form state
  let currentStep = $state(1);
  let submitting = $state(false);
  let isUploadingImages = $state(false);
  let showSuccess = $state(false);
  let publishError = $state<string | null>(null);
  let formElement: HTMLFormElement;
  let isDraftSaved = $state(false);
  let saveTimeout: ReturnType<typeof setTimeout>;
  
  let formData = $state({
    title: form?.values?.title || '',
    description: form?.values?.description || '',
    gender_category_id: form?.values?.gender_category_id || '',
    type_category_id: form?.values?.type_category_id || '',
    category_id: form?.values?.category_id || '',
    brand: form?.values?.brand || '',
    size: form?.values?.size || '',
    condition: (form?.values?.condition || 'good') as 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair',
    color: form?.values?.color || '',
    material: form?.values?.material || '',
    price: Number(form?.values?.price) || 0,
    shipping_cost: Number(form?.values?.shipping_cost) || 0,
    tags: form?.values?.tags || [] as string[],
    use_premium_boost: form?.values?.use_premium_boost || false
  });
  
  interface UploadedImage {
    url: string;
    path: string;
  }
  let uploadedImages = $state<UploadedImage[]>([]);
  
  const supabase = createBrowserSupabaseClient();
  console.log('[SELL] Supabase client created:', supabase);
  console.log('[SELL] Storage module:', supabase.storage);
  
  // Get session to check auth
  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[SELL] Current session:', session);
    if (session) {
      console.log('[SELL] Access token exists:', !!session.access_token);
    }
  });
  
  // Categories
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
  
  // Size options
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
        priceSuggestion = null;
      }
    }
  }
  
  $effect(() => {
    updatePriceSuggestions();
  });

  // Auto-save draft functionality
  $effect(() => {
    if (formData.title || uploadedImages.length > 0) {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        saveDraft();
      }, 30000); // Save every 30 seconds
    }
  });

  function saveDraft() {
    try {
      const draftData = {
        ...formData,
        uploadedImages: uploadedImages.map(img => ({ url: img.url, path: img.path })),
        currentStep,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem('sell-form-draft', JSON.stringify(draftData));
      isDraftSaved = true;
      setTimeout(() => isDraftSaved = false, 3000);
    } catch (error) {
      console.warn('Could not save draft:', error);
    }
  }

  function loadDraft() {
    try {
      const saved = localStorage.getItem('sell-form-draft');
      if (saved) {
        const draftData = JSON.parse(saved);
        if (confirm('Found a saved draft. Continue where you left off?')) {
          // Fix old condition values
          if (draftData.condition === 'new') {
            draftData.condition = 'brand_new_with_tags';
          } else if (draftData.condition === 'like-new') {
            draftData.condition = 'like_new';
          }
          
          Object.assign(formData, draftData);
          uploadedImages = draftData.uploadedImages || [];
          currentStep = draftData.currentStep || 1;
        }
      }
    } catch (error) {
      console.warn('Could not load draft:', error);
    }
  }

  onMount(() => {
    // Clear any old draft with wrong values
    const saved = localStorage.getItem('sell-form-draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.condition === 'new' || draft.condition === 'like-new') {
          localStorage.removeItem('sell-form-draft'); // Clear bad draft
        } else {
          loadDraft(); // Only load if valid
        }
      } catch {
        localStorage.removeItem('sell-form-draft');
      }
    }
    return () => clearTimeout(saveTimeout);
  });
  
  // Image handlers
  async function handleImageUpload(files: File[]): Promise<UploadedImage[]> {
    console.log('[handleImageUpload] Starting with files:', files.length);
    isUploadingImages = true;
    try {
      // Use the session from page data - this is already loaded server-side
      const userId = data.session?.user?.id;
      const accessToken = data.session?.access_token;
      
      console.log('[handleImageUpload] Using userId from session:', userId);
      console.log('[handleImageUpload] Access token available:', !!accessToken);
      
      if (!userId || !accessToken) {
        throw new Error('User not authenticated - please refresh the page');
      }
      
      console.log('[handleImageUpload] Calling uploadImages with direct access token');
      // Pass the access token to avoid hanging auth methods
      const uploaded = await uploadImages(supabase, files, 'product-images', userId, undefined, accessToken);
      console.log('[handleImageUpload] Upload completed, results:', uploaded.length);
      return uploaded;
    } catch (error) {
      console.error('[handleImageUpload] Error occurred:', error);
      throw error;
    } finally {
      console.log('[handleImageUpload] Finishing, setting uploading to false');
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
  
  // Validation
  const canProceedStep1 = $derived(
    // For testing, allow proceeding without images
    (uploadedImages.length > 0 || true) && // TODO: Remove || true after testing
    formData.title.length >= 3 && 
    formData.gender_category_id &&
    formData.type_category_id &&
    // Allow proceeding with just 2 tiers if no 3rd tier exists
    (formData.category_id || specificCategories.length === 0)
  );
  
  const canProceedStep2 = $derived(
    formData.brand && formData.size && formData.condition
  );
  
  const canProceedStep3 = $derived(
    formData.price > 0 && formData.shipping_cost >= 0
  );
  
  const canSubmit = $derived(
    // For testing, allow submission without images
    formData.title.length >= 3 && 
    formData.gender_category_id &&
    formData.type_category_id &&
    // Use type_category_id if no specific category exists
    (formData.category_id || specificCategories.length === 0) &&
    formData.brand && 
    formData.size && 
    formData.condition &&
    formData.price > 0 && 
    formData.shipping_cost >= 0
  );
</script>

<svelte:head>
  <title>List an Item • Driplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
  <!-- Modern Header -->
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
          <h1 class="text-lg font-semibold text-gray-900">Sell Your Item</h1>
          <div class="flex items-center justify-center gap-2 mt-0.5">
            <p class="text-xs text-gray-500">Step {currentStep} of 4</p>
            {#if isDraftSaved}
              <span class="text-xs text-green-600">• Saved</span>
            {/if}
          </div>
        </div>
        
        <button 
          onclick={() => goto('/dashboard')}
          class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
    
    <!-- Beautiful Progress Bar -->
    <div class="h-1 bg-gray-100">
      <div 
        class="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500 ease-out"
        style="width: {(currentStep / 4) * 100}%"
      />
    </div>
  </header>

  <!-- Content - flex-1 to fill available space -->
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
              // Handle errors
              const errorMessage = result.data?.errors?._form || 'Failed to create listing';
              publishError = errorMessage;
              toasts.error(errorMessage);
            } else if (result.type === 'success' && result.data?.success) {
              // SUCCESS! Product created
              showSuccess = true;
              toasts.success('Listing published successfully!');
              
              const productId = result.data.productId;
              
              // Redirect to product page after 1.5 seconds
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
        <!-- Step 1: Photos & Basic Info -->
        {#if currentStep === 1}
          <StepPhotosAndBasicInfo
            bind:formData
            bind:uploadedImages
            categories={data.categories}
            bind:isUploadingImages
            onImageUpload={handleImageUpload}
            onImageDelete={handleImageDelete}
            onFieldChange={(field, value) => {
              // Could add validation here if needed
            }}
          />
        {/if}
        
        <!-- Step 2: Product Details -->
        {#if currentStep === 2}
          <div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Product Details</h2>
              <p class="text-gray-600">Help buyers find what they're looking for</p>
            </div>
            
            <StepProductInfo
              bind:formData
              sizeOptions={sizeOptions}
              errors={{}}
              touched={{}}
              onFieldChange={(field, value) => {
                // Trigger validation if needed
              }}
              onFieldBlur={(field) => {
                // Mark field as touched
              }}
            />
          </div>
        {/if}
        
        <!-- Step 3: Pricing -->
        {#if currentStep === 3}
          <div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Set Your Price</h2>
              <p class="text-gray-600">Competitive pricing sells faster</p>
            </div>
            
            <StepPricing
              bind:formData
              profile={data.profile}
              {priceSuggestion}
              errors={{}}
              touched={{}}
              onFieldChange={(field, value) => {
                // Could trigger price suggestion update here
              }}
              onFieldBlur={(field) => {
                // Mark field as touched
              }}
            />
          </div>
        {/if}
        
        <!-- Step 4: Review -->
        {#if currentStep === 4}
          <div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Review Your Listing</h2>
              <p class="text-gray-600">Everything look good?</p>
            </div>
            
            <!-- Preview Card -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {#if uploadedImages[0]}
                <img 
                  src={uploadedImages[0].url} 
                  alt={formData.title}
                  class="w-full h-48 object-cover"
                />
              {/if}
              
              <div class="p-4 space-y-3">
                <h3 class="font-semibold text-lg">{formData.title}</h3>
                
                <div class="flex items-center justify-between">
                  <span class="text-2xl font-bold">${formData.price}</span>
                  {#if formData.shipping_cost > 0}
                    <span class="text-sm text-gray-500">+ ${formData.shipping_cost} shipping</span>
                  {/if}
                </div>
                
                <div class="flex flex-wrap gap-2">
                  <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">{formData.brand}</span>
                  <span class="px-2 py-1 bg-gray-100 text-xs rounded-full">Size {formData.size}</span>
                  <span class="px-2 py-1 bg-gray-100 text-xs rounded-full capitalize">{formData.condition.replace('-', ' ')}</span>
                </div>
                
                {#if formData.description}
                  <p class="text-sm text-gray-600 line-clamp-2">{formData.description}</p>
                {/if}
              </div>
            </div>
            
            {#if publishError}
              <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p class="text-sm text-red-600">{publishError}</p>
              </div>
            {/if}
          </div>
        {/if}
      </form>
    {/if}
    </div>
  </div>
  
  <!-- Sticky Navigation - Outside of content, fixed at bottom -->
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
        
        {#if currentStep < 4}
          <Button
            type="button"
            variant="primary"
            onclick={() => {
              if ((currentStep === 1 && canProceedStep1) ||
                  (currentStep === 2 && canProceedStep2) ||
                  (currentStep === 3 && canProceedStep3)) {
                currentStep++;
                publishError = null;
              } else {
                // Show specific validation message
                if (currentStep === 1) {
                  if (uploadedImages.length === 0) {
                    toasts.error('Please add at least one photo');
                  } else if (formData.title.length < 3) {
                    toasts.error('Title must be at least 3 characters');
                  } else if (!formData.gender_category_id || !formData.type_category_id) {
                    toasts.error('Please select categories');
                  }
                } else if (currentStep === 2) {
                  if (!formData.brand) toasts.error('Please select a brand');
                  else if (!formData.size) toasts.error('Please select a size');
                  else if (!formData.condition) toasts.error('Please select condition');
                } else if (currentStep === 3) {
                  if (!formData.price || formData.price <= 0) {
                    toasts.error('Please set a valid price');
                  }
                }
              }
            }}
            disabled={submitting}
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
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Publishing...
              </span>
            {:else}
              Publish Listing
              <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </Button>
        {/if}
      </div>
    </div>
  {/if}
    
  <!-- Success Screen -->
  {#if showSuccess}
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div class="text-center px-6 py-12 max-w-md mx-auto w-full">
        <!-- Success Icon with animation -->
        <div class="mb-8">
          <div class="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-in">
            <svg class="w-16 h-16 text-white animate-check-mark" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <!-- Success Message -->
        <h2 class="text-3xl font-bold text-gray-900 mb-4">Success! 🎉</h2>
        <p class="text-lg text-gray-600 mb-3">Your listing is now live!</p>
        <p class="text-sm text-gray-500 mb-8">Buyers can now discover and purchase your item.</p>
        
        <!-- Action Buttons -->
        <div class="space-y-3">
          <Button
            variant="primary"
            onclick={() => goto('/')}
            class="w-full h-12"
          >
            Back to Home
          </Button>
          <Button
            variant="ghost"
            onclick={() => {
              showSuccess = false;
              currentStep = 1;
              // Reset form
              formData = {
                title: '',
                description: '',
                gender_category_id: '',
                type_category_id: '',
                category_id: '',
                brand: '',
                size: '',
                condition: 'good' as const,
                color: '',
                material: '',
                price: 0,
                shipping_cost: 0,
                tags: [],
                use_premium_boost: false
              };
              uploadedImages = [];
            }}
            class="w-full h-12"
          >
            List Another Item
          </Button>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  @keyframes animate-in {
    from {
      opacity: 0;
      transform: translateX(10px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  .animate-in {
    animation: animate-in 0.3s ease-out;
  }
  
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  
  @keyframes bounce-in {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  .animate-bounce-in {
    animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }
  
  @keyframes check-mark {
    0% {
      stroke-dasharray: 0 100;
    }
    100% {
      stroke-dasharray: 100 100;
    }
  }
  
  .animate-check-mark {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: check-mark 0.8s ease-out 0.3s forwards;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  .animate-spin {
    animation: spin 1s linear infinite;
  }
</style>