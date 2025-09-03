<script lang="ts">
  import { goto } from '$app/navigation';
  import { getPriceSuggestions } from '$lib/client/products';
  import { SIZE_CATEGORIES } from '$lib/validation/product';
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { Button, toasts, ErrorBoundary } from '@repo/ui';
  import { uploadImages, deleteImage } from '$lib/supabase/storage';
  // Dynamic imports for code-splitting - components loaded only when needed
  let StepPhotosOnly: any = $state(null);
  let StepCategory: any = $state(null);
  let StepProductInfo: any = $state(null);
  let StepPricing: any = $state(null);
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import { onMount } from 'svelte';
  import * as i18n from '@repo/i18n';
  import { analyzeImageForCategories, mergeSuggestions, type CategorySuggestion } from '$lib/utils/imageAnalysis';
  import { scrollIntoView, focusWithAnnouncement } from '$lib/utils/navigation';

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
  let validationMessage = $state<string | null>(null);
  let showValidationPopup = $state(false);
  let isProgressing = $state(false);
  let stepContainer = $state<HTMLElement>();
  
  // Show validation message with auto-hide
  function showValidation(message: string) {
    validationMessage = message;
    showValidationPopup = true;
    setTimeout(() => {
      showValidationPopup = false;
    }, 3000);
  }
  
  // Dynamic component loading functions for code-splitting
  async function loadStepComponent(step: number) {
    switch (step) {
      case 1:
        if (!StepPhotosOnly) {
          const module = await import('./components/StepPhotosOnly.svelte');
          StepPhotosOnly = module.default;
        }
        break;
      case 2:
        if (!StepCategory) {
          const module = await import('./components/StepCategory.svelte');
          StepCategory = module.default;
        }
        break;
      case 3:
        if (!StepProductInfo) {
          const module = await import('./components/StepProductInfo.svelte');
          StepProductInfo = module.default;
        }
        break;
      case 4:
        if (!StepPricing) {
          const module = await import('./components/StepPricing.svelte');
          StepPricing = module.default;
        }
        break;
    }
  }
  let formElement = $state<HTMLFormElement>();
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
    condition: (form?.values?.condition || 'good') as 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair', // Always default to 'good'
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
  
  // Image analysis suggestions
  let categorySuggestions = $state<CategorySuggestion | null>(null);
  let showSuggestions = $state(false);
  
  const supabase = createBrowserSupabaseClient();
  
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

  onMount(async () => {
    // Load initial step component
    await loadStepComponent(currentStep);
    
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
    isUploadingImages = true;
    try {
      const userId = data.session?.user?.id;
      const accessToken = data.session?.access_token;
      
      if (!userId || !accessToken) {
        throw new Error('User not authenticated - please refresh the page');
      }
      
      const uploaded = await uploadImages(supabase, files, 'product-images', userId, undefined, accessToken);
      
      // Analyze first image for category suggestions
      if (uploaded.length > 0 && files.length > 0) {
        try {
          const suggestions = await analyzeImageForCategories(files[0], uploaded[0].url);
          if (suggestions.length > 0) {
            categorySuggestions = mergeSuggestions(suggestions);
            showSuggestions = true;
          }
        } catch (error) {
          console.error('Image analysis failed:', error);
        }
      }
      
      return uploaded;
    } catch (error) {
      console.error('[handleImageUpload] Error occurred:', error);
      throw error;
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
  
  // Validation
  const canProceedStep1 = $derived(
    // uploadedImages.length > 0 && // Temporarily disable photo requirement for testing
    formData.title.length >= 3 && 
    formData.description.length >= 10 // Require min 10 chars for description
  );
  
  const canProceedStep2 = $derived(
    formData.gender_category_id &&
    formData.type_category_id &&
    // Allow proceeding with just 2 tiers if no 3rd tier exists
    (formData.category_id || specificCategories.length === 0) &&
    formData.condition // Now condition is required in Step 2
  );
  
  const canProceedStep3 = $derived(
    formData.brand && 
    formData.size // Condition removed from Step 3 validation
  );
  
  const canProceedStep4 = $derived(
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

  // Helper function to get step titles for accessibility announcements
  function getStepTitle(stepNumber: number): string {
    switch (stepNumber) {
      case 1: return i18n.sell_step1();
      case 2: return i18n.sell_step2();
      case 3: return i18n.sell_step3();
      case 4: return i18n.sell_step4();
      case 5: return i18n.sell_step4(); // Review step shares title with pricing
      default: return '';
    }
  }

  // Better navigation with accessibility considerations
  function navigateToStep() {
    if (stepContainer) {
      // Focus management for screen readers with step announcement
      focusWithAnnouncement(
        stepContainer, 
        `Step ${currentStep} of 5: ${getStepTitle(currentStep)}`
      );
    } else {
      // Fallback: scroll to top of content area with motion preference support
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const contentArea = document.querySelector('.overflow-y-auto');
      
      if (contentArea) {
        // Scroll within the content container
        contentArea.scrollTo({ 
          top: 0, 
          behavior: prefersReducedMotion ? 'auto' : 'smooth' 
        });
      } else {
        // Final fallback: window scroll
        window.scrollTo({ 
          top: 0, 
          behavior: prefersReducedMotion ? 'auto' : 'smooth' 
        });
      }
    }
  }
</script>

<svelte:head>
  <title>List an Item • Driplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
</svelte:head>

<div class="h-screen bg-white flex flex-col fixed inset-0">
  <!-- Validation Popup - Top of screen -->
  {#if showValidationPopup}
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top duration-200">
      <div class="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm font-medium">{validationMessage}</p>
      </div>
    </div>
  {/if}
  
  <!-- Clean Progress Bar -->
  <div class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
    <!-- Close button -->
    <button 
      onclick={() => goto('/')}
      class="absolute right-3 top-3 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
      aria-label="Close"
    >
      <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- Step info and progress -->
    <div class="px-4 py-4 pr-12">
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-sm font-semibold text-gray-900">
            {#if currentStep === 1}
              {i18n.sell_step1()}
            {:else if currentStep === 2}
              {i18n.sell_step2()}
            {:else if currentStep === 3}
              {i18n.sell_step3()}
            {:else if currentStep === 4}
              {i18n.sell_step4()}
            {:else if currentStep === 5}
              {i18n.sell_step4()}
            {/if}
          </h2>
          <p class="text-xs text-gray-500 mt-0.5">
            Step {currentStep} of 5
          </p>
        </div>
        {#if isDraftSaved}
          <div class="flex items-center gap-1.5 text-green-600">
            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
            <span class="text-xs font-medium">Saved</span>
          </div>
        {/if}
      </div>
      
      <!-- Progress bar -->
      <div class="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
        <div 
          class="h-full bg-[color:var(--primary)] rounded-full transition-all duration-300 ease-out {isProgressing ? 'animate-pulse' : ''}"
          style="width: {((currentStep - 1) / 4) * 100}%"
        ></div>
      </div>
    </div>
  </div>

  <!-- Content - flex-1 to fill available space -->
  <!-- Scrollable content area between fixed header and footer -->
  <div class="flex-1 overflow-y-auto pt-[72px] pb-[88px]">
    <div class="max-w-lg mx-auto px-4 py-4">
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
        action="?/create"
        bind:this={formElement}
        use:enhance={({ formData: formDataObj }) => {
          submitting = true;
          publishError = null;
          
          // Capture current formData state to avoid Svelte warning
          const currentFormData = { ...formData };
          
          // Validate condition before form submission
          // Ensure condition is ALWAYS sent with valid value
          const validConditions = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'];
          const conditionValue = currentFormData.condition && validConditions.includes(currentFormData.condition) ? currentFormData.condition : 'good';
          formDataObj.set('condition', conditionValue);
          
          // Add all OTHER form data (skip condition since we already handled it)
          Object.entries(currentFormData).forEach(([key, value]) => {
            if (key === 'condition') return; // Skip condition - already handled above
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
        <!-- Step 1: Photos Only -->
        {#if currentStep === 1}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 1 of 5: {i18n.sell_step1()}">
            <ErrorBoundary
              resetKeys={[currentStep]}
              onError={(error) => {
                console.error('Error in Step 1 (Photos):', error);
                toasts.error('An error occurred while loading photos step. Please try again.');
              }}
            >
              {#if StepPhotosOnly}
                <svelte:component
                  this={StepPhotosOnly}
                  bind:formData
                  bind:uploadedImages
                  bind:isUploadingImages
                  onImageUpload={handleImageUpload}
                  onImageDelete={handleImageDelete}
                  onFieldChange={(field, value) => {
                    // Could add validation here if needed
                  }}
                />
              {:else}
                <div class="flex items-center justify-center py-8">
                  <div class="text-sm text-gray-500">{i18n.loading()}</div>
                </div>
              {/if}
            </ErrorBoundary>
          </div>
        {/if}

        <!-- Step 2: Category Selection -->
        {#if currentStep === 2}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 2 of 5: {i18n.sell_step2()}">
            <ErrorBoundary
              resetKeys={[currentStep]}
              onError={(error) => {
                console.error('Error in Step 2 (Category):', error);
                toasts.error('An error occurred while loading category step. Please try again.');
              }}
            >
              {#if StepCategory}
                <svelte:component
                  this={StepCategory}
                  categories={data.categories}
                  bind:formData
                  suggestions={categorySuggestions}
                  showSuggestions={showSuggestions}
                  onFieldChange={(field, value) => {
                    // Update category fields
                    if (field === 'gender') formData.gender_category_id = value;
                    if (field === 'type') formData.type_category_id = value;
                    if (field === 'specific') formData.category_id = value;
                    if (field === 'condition') formData.condition = value;
                  }}
                  onDismissSuggestions={() => showSuggestions = false}
                  onApplySuggestions={() => {
                    if (categorySuggestions) {
                      // Map suggestion to actual category IDs
                      if (categorySuggestions.gender) {
                        const genderCat = genderCategories.find(c => c.name === categorySuggestions.gender);
                        if (genderCat) {
                          formData.gender_category_id = genderCat.id;
                        }
                      }
                      if (categorySuggestions.type && formData.gender_category_id) {
                        const typeCat = typeCategories.find(c => c.name === categorySuggestions.type);
                        if (typeCat) {
                          formData.type_category_id = typeCat.id;
                        }
                      }
                      if (categorySuggestions.specific && formData.type_category_id) {
                        const specificCat = specificCategories.find(c => c.name === categorySuggestions.specific);
                        if (specificCat) {
                          formData.category_id = specificCat.id;
                        }
                      }
                      showSuggestions = false;
                      toasts.success('Applied category suggestions!');
                    }
                  }}
                />
              {:else}
                <div class="flex items-center justify-center py-8">
                  <div class="text-sm text-gray-500">{i18n.loading()}</div>
                </div>
              {/if}
            </ErrorBoundary>
          </div>
        {/if}
        
        <!-- Step 3: Product Details -->
        {#if currentStep === 3}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 3 of 5: {i18n.sell_step3()}" class="space-y-5 animate-in fade-in slide-in-from-right duration-300 min-h-[50vh]">
            <ErrorBoundary
              resetKeys={[currentStep]}
              onError={(error) => {
                console.error('Error in Step 3 (Product Info):', error);
                toasts.error('An error occurred while loading product details step. Please try again.');
              }}
            >
              {#if StepProductInfo}
                <svelte:component
                  this={StepProductInfo}
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
              {:else}
                <div class="flex items-center justify-center py-8">
                  <div class="text-sm text-gray-500">{i18n.loading()}</div>
                </div>
              {/if}
            </ErrorBoundary>
          </div>
        {/if}
        
        <!-- Step 4: Pricing -->
        {#if currentStep === 4}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 4 of 5: {i18n.sell_step4()}" class="space-y-5 animate-in fade-in slide-in-from-right duration-300 min-h-[50vh]">
            <ErrorBoundary
              resetKeys={[currentStep]}
              onError={(error) => {
                console.error('Error in Step 4 (Pricing):', error);
                toasts.error('An error occurred while loading pricing step. Please try again.');
              }}
            >
              {#if StepPricing}
                <svelte:component
                  this={StepPricing}
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
              {:else}
                <div class="flex items-center justify-center py-8">
                  <div class="text-sm text-gray-500">{i18n.loading()}</div>
                </div>
              {/if}
            </ErrorBoundary>
          </div>
        {/if}
        
        <!-- Step 5: Review -->
        {#if currentStep === 5}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 5 of 5: Review listing" class="space-y-5 animate-in fade-in slide-in-from-right duration-300 min-h-[50vh]">
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <div class="text-center mb-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-1">{i18n.sell_reviewListing()}</h2>
                <p class="text-sm text-gray-600">Everything look good? Your listing will appear like this:</p>
              </div>
              
              <!-- Enhanced Preview Card -->
              <div class="bg-gray-50 rounded-xl border border-gray-300 overflow-hidden max-w-sm mx-auto">
                <!-- Image Gallery Preview -->
                {#if uploadedImages.length > 0}
                  <div class="relative">
                    <img 
                      src={uploadedImages[0].url} 
                      alt={formData.title}
                      class="w-full h-56 object-cover"
                    />
                    {#if uploadedImages.length > 1}
                      <div class="absolute top-2 right-2 bg-[color:var(--primary)]/70 text-[color:var(--primary-fg)] text-xs px-2 py-1 rounded-full">
                        1/{uploadedImages.length}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="h-56 bg-gray-200 flex items-center justify-center">
                    <p class="text-gray-500 text-sm">No images uploaded</p>
                  </div>
                {/if}
                
                <div class="p-4 space-y-3">
                  <!-- Category Breadcrumb -->
                  <div class="text-xs text-gray-500 uppercase tracking-wide">
                    {#if genderCategories.find(c => c.id === formData.gender_category_id)}
                      {genderCategories.find(c => c.id === formData.gender_category_id)?.name}
                    {/if}
                    {#if typeCategories.find(c => c.id === formData.type_category_id)}
                      › {typeCategories.find(c => c.id === formData.type_category_id)?.name}
                    {/if}
                  </div>
                  
                  <h3 class="font-semibold text-lg line-clamp-2">{formData.title}</h3>
                  
                  <!-- Price Section -->
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-2xl font-bold text-gray-900">${formData.price}</span>
                      {#if formData.shipping_cost > 0}
                        <div class="text-sm text-gray-500">+ ${formData.shipping_cost} shipping</div>
                      {:else if formData.shipping_cost === 0}
                        <div class="text-sm text-green-600 font-medium">{i18n.sell_free()} {i18n.sell_shippingCost()}</div>
                      {/if}
                    </div>
                    <div class="text-right">
                      <div class="text-xs text-gray-500">{i18n.sell_yourEarnings()}</div>
                      <div class="text-sm font-semibold text-green-600">${(formData.price * 0.9).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <!-- Product Details -->
                  <div class="flex flex-wrap gap-1.5">
                    <span class="px-2 py-1 bg-white border text-xs rounded-full">{formData.brand}</span>
                    <span class="px-2 py-1 bg-white border text-xs rounded-full">{i18n.product_size()} {formData.size}</span>
                    <span class="px-2 py-1 bg-white border text-xs rounded-full capitalize">{formData.condition.replace('_', ' ').replace('-', ' ')}</span>
                    {#if formData.color}
                      <span class="px-2 py-1 bg-white border text-xs rounded-full">{formData.color}</span>
                    {/if}
                  </div>
                  
                  <!-- Description -->
                  {#if formData.description}
                    <div class="pt-2 border-t border-gray-200">
                      <p class="text-sm text-gray-600 leading-relaxed line-clamp-3">{formData.description}</p>
                    </div>
                  {/if}
                  
                  <!-- Tags -->
                  {#if formData.tags && formData.tags.length > 0}
                    <div class="flex flex-wrap gap-1">
                      {#each formData.tags.slice(0, 3) as tag}
                        <span class="text-xs text-gray-500">#{tag}</span>
                      {/each}
                      {#if formData.tags.length > 3}
                        <span class="text-xs text-gray-400">+{formData.tags.length - 3} {i18n.sell_moreTag()}</span>
                      {/if}
                    </div>
                  {/if}
                  
                  <!-- Premium Boost Indicator -->
                  {#if formData.use_premium_boost}
                    <div class="flex items-center justify-center gap-2 py-2 bg-purple-100 border border-purple-200 rounded-lg">
                      <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span class="text-xs font-medium text-purple-700">{i18n.sell_premiumBoost()}</span>
                    </div>
                  {/if}
                </div>
              </div>
              
              <!-- Summary Stats -->
              <div class="mt-6 grid grid-cols-3 gap-4 p-3 bg-gray-50 rounded-lg">
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900">{uploadedImages.length}</div>
                  <div class="text-xs text-gray-500">{i18n.sell_photos()}</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-gray-900">${formData.price}</div>
                  <div class="text-xs text-gray-500">{i18n.price()}</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-bold text-green-600">${(formData.price * 0.9).toFixed(2)}</div>
                  <div class="text-xs text-gray-500">{i18n.sell_yourEarnings()}</div>
                </div>
              </div>
              
              {#if publishError}
                <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p class="text-sm text-red-600">{publishError}</p>
                </div>
              {/if}
            </div>
          </div>
        {/if}
        
        <!-- CRITICAL: NO HIDDEN INPUTS - all data handled in enhance function -->
      </form>
    {/if}
    </div>
  </div>
  
  <!-- Enhanced Sticky Navigation - Better touch targets -->
  {#if !data.needsBrandSubscription && !showSuccess}
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 z-40 shadow-lg shadow-black/5">
      <div class="max-w-lg mx-auto flex gap-3">
        {#if currentStep > 1}
          <Button
            type="button"
            variant="ghost"
            onclick={() => {
              isProgressing = true;
              publishError = null;
              setTimeout(async () => {
                currentStep--;
                await loadStepComponent(currentStep);
                navigateToStep();
                isProgressing = false;
              }, 150);
            }}
            disabled={submitting}
            class="flex-1 min-h-[48px]"
          >
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            {i18n.common_back()}
          </Button>
        {/if}
        
        {#if currentStep < 5}
          <Button
            type="button"
            variant="primary"
            onclick={() => {
              if ((currentStep === 1 && canProceedStep1) ||
                  (currentStep === 2 && canProceedStep2) ||
                  (currentStep === 3 && canProceedStep3) ||
                  (currentStep === 4 && canProceedStep4)) {
                isProgressing = true;
                publishError = null;
                setTimeout(async () => {
                  currentStep++;
                  await loadStepComponent(currentStep);
                  navigateToStep();
                  isProgressing = false;
                }, 150);
              } else {
                // Show specific validation message
                if (currentStep === 1) {
                  // if (uploadedImages.length === 0) {
                  //   showValidation('Please upload at least 1 photo');
                  // } else 
                  if (formData.title.length < 3) {
                    showValidation('Title must be at least 3 characters');
                  } else if (formData.description.length < 10) {
                    showValidation('Description must be at least 10 characters');
                  }
                } else if (currentStep === 2) {
                  if (!formData.gender_category_id) {
                    showValidation('Please select a gender category');
                  } else if (!formData.type_category_id) {
                    showValidation('Please select a category type');
                  } else if (!formData.condition) {
                    showValidation('Please select item condition');
                  }
                } else if (currentStep === 3) {
                  if (!formData.brand) {
                    showValidation('Please enter a brand');
                  } else if (!formData.size) {
                    showValidation('Please select a size');
                  }
                } else if (currentStep === 4) {
                  if (!formData.price || formData.price <= 0) {
                    showValidation('Please enter a price');
                  }
                }
              }
            }}
            disabled={submitting}
            class="flex-1 min-h-[48px]"
          >
            {i18n.common_next()}
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        {:else if currentStep === 5}
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
            class="flex-1 min-h-[48px]"
          >
            {#if submitting}
              <span class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {i18n.sell_publishing()}
              </span>
            {:else}
              {i18n.sell_confirmPublish()}
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
        <!-- Clean Success Icon -->
        <div class="mb-6">
          <div class="w-24 h-24 mx-auto bg-[color:var(--primary)] rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-[color:var(--primary-fg)]" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <!-- Success Message -->
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{i18n.sell_listingSuccess()}</h2>
        <p class="text-gray-600 mb-8">Your item is now live and available for purchase.</p>
        
        <!-- Product Preview -->
        {#if uploadedImages[0]}
          <div class="mb-6 bg-gray-50 rounded-lg p-3 flex items-center gap-3">
            <img 
              src={uploadedImages[0].url} 
              alt={formData.title}
              class="w-16 h-16 object-cover rounded-md"
            />
            <div class="text-left flex-1">
              <p class="font-medium text-sm text-gray-900 line-clamp-1">{formData.title}</p>
              <p class="text-lg font-bold">${formData.price}</p>
            </div>
          </div>
        {/if}
        
        <!-- Action Buttons -->
        <div class="space-y-2">
          <button
            onclick={() => goto('/')}
            class="w-full px-4 py-3 bg-[color:var(--primary)] text-[color:var(--primary-fg)] rounded-lg font-medium hover:bg-[color:var(--primary-600)] transition-colors"
          >
            {i18n.sell_viewListing()}
          </button>
          <button
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
            class="w-full px-4 py-3 border-2 border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            {i18n.sell_listAnother()}
          </button>
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
  
  
  @keyframes check-mark {
    0% {
      stroke-dasharray: 0 100;
    }
    100% {
      stroke-dasharray: 100 100;
    }
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