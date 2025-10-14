<script lang="ts">
  import { goto } from '$app/navigation';
  import { getPriceSuggestions } from '$lib/client/products';
  import type { PageData, ActionData } from './$types';
  import { enhance } from '$app/forms';
  import { Button, toasts, ErrorBoundary } from '@repo/ui';
  import { uploadImages, deleteImage } from '$lib/supabase/storage';
  import { createBrowserSupabaseClient } from '$lib/supabase/client';
  import * as i18n from '@repo/i18n';
  import { analyzeImageForCategories, mergeSuggestions, type CategorySuggestion } from '$lib/utils/imageAnalysis';
  import { focusWithAnnouncement } from '$lib/utils/navigation';
  // Static imports - no more dynamic loading
  import StepPhotosOnly from './components/StepPhotosOnly.svelte';
  import StepCategory from './components/StepCategory.svelte';
  import StepPricing from './components/StepPricing.svelte';

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
  let stepContainer = $state<HTMLElement>();
  let productId = $state<string | null>(null);
  
  // Show validation message with auto-hide
  function showValidation(message: string) {
    validationMessage = message;
    showValidationPopup = true;
    setTimeout(() => {
      showValidationPopup = false;
    }, 3000);
  }
  
  // Dynamic loading removed - all components now statically imported
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
    data.categories?.filter((cat: any) => !cat.parent_id) || []
  );

  const typeCategories = $derived(
    formData.gender_category_id 
      ? data.categories?.filter((cat: any) => cat.parent_id === formData.gender_category_id) || []
      : []
  );

  const specificCategories = $derived(
    formData.type_category_id
      ? data.categories?.filter((cat: any) => cat.parent_id === formData.type_category_id) || []
      : []
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
          condition: formData.condition as 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair',
          size: formData.size
        });
        priceSuggestion = suggestions;
      } catch {
        priceSuggestion = null;
      }
    }
  }
  
  $effect(() => {
    if (typeof window !== 'undefined') {
      updatePriceSuggestions();
    }
  });

  // Auto-save draft functionality
  $effect(() => {
    if (typeof window !== 'undefined' && (formData.title || uploadedImages.length > 0)) {
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
    } catch {
      // Failed to save draft - continue silently
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
    } catch {
      // Failed to load draft - continue silently
    }
  }

  // Initialize draft handling and cleanup
  $effect(() => {
    if (typeof window !== 'undefined') {
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
    }

    return () => clearTimeout(saveTimeout);
  });
  
  // Image handlers
  async function handleImageUpload(files: File[]): Promise<UploadedImage[]> {
    isUploadingImages = true;
    try {
      // Use secure pattern: user data from server is already validated by safeGetSession()
      const userId = data.user?.id;
      const accessToken = data.session?.access_token;

      if (!userId || !accessToken) {
        throw new Error('User not authenticated - please refresh the page');
      }
      
      const uploaded = await uploadImages(supabase, files, 'product-images', userId, undefined, accessToken);
      
      // Analyze first image for category suggestions
      if (uploaded.length > 0 && files.length > 0 && files[0] && uploaded[0]) {
        try {
          const suggestions = await analyzeImageForCategories(files[0], uploaded[0].url);
          if (suggestions.length > 0) {
            categorySuggestions = mergeSuggestions(suggestions);
            showSuggestions = true;
          }
        } catch {
          // Failed to analyze image - continue silently
        }
      }
      
      return uploaded;
    } catch (error) {
      isUploadingImages = false;
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
    formData.condition
    // Removed brand and size - now handled in separate step after sub-step carousel
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
    formData.condition &&
    formData.price > 0 &&
    formData.shipping_cost >= 0
  );

  // Helper function to get step titles for accessibility announcements
  function getStepTitle(stepNumber: number): string {
    switch (stepNumber) {
      case 1: return i18n.sell_step1();
      case 2: return 'Category & Details';
      case 3: return i18n.sell_step4(); // Pricing
      case 4: return 'Review Listing'; // Review step
      default: return '';
    }
  }

  // Helper function to get step instructions

  // Simplified navigation - no scrolling needed with full viewport steps
  function navigateToStep() {
    // Focus management for accessibility
    if (stepContainer) {
      setTimeout(() => {
        if (stepContainer) {
          focusWithAnnouncement(
            stepContainer,
            `Step ${currentStep} of 4: ${getStepTitle(currentStep)}`
          );
        }
      }, 100);
    }
  }
</script>

<svelte:head>
  <title>List an Item • Driplo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
</svelte:head>

<div class="min-h-[100dvh] bg-[color:var(--surface-base)] flex flex-col sell-form-container">
  <!-- Validation Popup - Top of screen -->
  {#if showValidationPopup}
    <div class="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top duration-200">
      <div class="bg-[color:var(--status-error-solid)] text-[color:var(--status-error-solid-fg)] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-sm">
        <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
        </svg>
        <p class="text-sm font-medium">{validationMessage}</p>
      </div>
    </div>
  {/if}

  <!-- Compact Mobile Header -->
  <div class="flex-shrink-0 bg-[color:var(--surface-base)] border-b border-[color:var(--border-subtle)] px-4 py-3">
    <div class="flex items-center justify-between">
      <!-- Back button -->
      <button
        onclick={() => goto('/')}
        class="flex items-center justify-center w-10 h-10 hover:bg-[color:var(--surface-subtle)] rounded-full transition-colors"
        aria-label="Close listing form"
      >
        <svg class="w-5 h-5 text-[color:var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Step title with inline progress -->
      <div class="flex-1 text-center">
        <h1 class="text-base font-semibold text-[color:var(--text-primary)]">
          {getStepTitle(currentStep)}
        </h1>
        <div class="text-xs text-[color:var(--text-tertiary)] mt-0.5">
          Step {currentStep} of 4
          {#if isDraftSaved}
            • <span class="text-[color:var(--status-success-text)]">Saved</span>
          {/if}
        </div>
      </div>

      <!-- Progress indicator -->
      <div class="w-10 h-10 flex items-center justify-center">
        <div class="w-8 h-8 rounded-full bg-[color:var(--surface-subtle)] flex items-center justify-center">
          <div
            class="w-6 h-6 rounded-full bg-[color:var(--brand-primary)] flex items-center justify-center relative overflow-hidden"
            style="mask: conic-gradient(from 0deg, transparent 0deg, transparent {((currentStep - 1) / 3) * 360}deg, black {((currentStep - 1) / 3) * 360}deg);"
          >
            <div class="w-4 h-4 rounded-full bg-[color:var(--surface-base)]"></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Scrollable Content Area -->
  <div class="flex-1 bg-[color:var(--surface-subtle)] flex flex-col overflow-y-auto">
    {#if data.needsBrandSubscription}
      <!-- Brand subscription required -->
      <div class="text-center py-12 max-w-lg mx-auto w-full px-4">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-[color:var(--brand-primary-subtle)] rounded-full mb-4">
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
      <!-- Multi-step Form Container -->
      <div class="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 pb-4">
        <form
          method="POST"
          action="?/create"
          bind:this={formElement}
          use:enhance={({ formData: formDataObj, cancel }) => {
            submitting = true;
            publishError = null;

            // Capture current formData state to avoid Svelte warning
            const currentFormData = { ...formData };

            // Validate required fields before submission
            if (!currentFormData.title || currentFormData.title.length < 3) {
              cancel();
              submitting = false;
              publishError = 'Title must be at least 3 characters';
              toasts.error(publishError);
              return;
            }

            if (!currentFormData.gender_category_id || !currentFormData.type_category_id) {
              cancel();
              submitting = false;
              publishError = 'Please select a category';
              toasts.error(publishError);
              return;
            }

            if (!currentFormData.price || currentFormData.price <= 0) {
              cancel();
              submitting = false;
              publishError = 'Please enter a valid price';
              toasts.error(publishError);
              return;
            }

            // Determine final category_id to use
            // Use specific category if available, otherwise fall back to type_category_id
            const finalCategoryId = currentFormData.category_id || currentFormData.type_category_id;
            
            // Validate condition before form submission
            // Ensure condition is ALWAYS sent with valid value
            const validConditions = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'];
            const conditionValue = currentFormData.condition && validConditions.includes(currentFormData.condition) ? currentFormData.condition : 'good';
            
            // Build form data explicitly
            formDataObj.set('title', currentFormData.title.trim());
            formDataObj.set('description', (currentFormData.description || '').trim());
            formDataObj.set('gender_category_id', currentFormData.gender_category_id);
            formDataObj.set('type_category_id', currentFormData.type_category_id);
            formDataObj.set('category_id', finalCategoryId);
            formDataObj.set('condition', conditionValue);
            formDataObj.set('price', currentFormData.price.toString());
            formDataObj.set('shipping_cost', (currentFormData.shipping_cost || 0).toString());
            formDataObj.set('brand', (currentFormData.brand || '').trim());
            formDataObj.set('size', currentFormData.size || '');
            formDataObj.set('color', (currentFormData.color || '').trim());
            formDataObj.set('material', (currentFormData.material || '').trim());
            formDataObj.set('tags', JSON.stringify(currentFormData.tags || []));
            formDataObj.set('use_premium_boost', currentFormData.use_premium_boost ? 'true' : 'false');
            formDataObj.set('photo_urls', JSON.stringify(uploadedImages.map(img => img.url)));
            formDataObj.set('photo_paths', JSON.stringify(uploadedImages.map(img => img.path)));

            return async ({ result, update }) => {
              submitting = false;

              if (result.type === 'failure') {
                // Handle errors
                const errors = (result.data as any)?.errors || {};
                const errorMessage = errors._form || errors.category_id || Object.values(errors)[0] || 'Failed to create listing';
                publishError = errorMessage as string;
                toasts.error(errorMessage as string);
                
                // Scroll to top to show error
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else if (result.type === 'success') {
                const successData = result.data as any;
                if (successData?.success) {
                  // SUCCESS! Product created
                  showSuccess = true;
                  productId = successData.productId as string;
                  toasts.success('Listing published successfully!');

                  // Clear draft
                  localStorage.removeItem('sell-form-draft');

                  // Redirect to product page after 1.5 seconds
                  setTimeout(() => {
                    if (productId) {
                      goto(`/product/${productId}`);
                    } else {
                      goto('/');
                    }
                  }, 1500);
                }
              }

              await update();
            };
          }}
        >
        <!-- Step 1: Photos Only -->
        {#if currentStep === 1}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 1 of 4: {i18n.sell_step1()}">
            <ErrorBoundary
              resetKeys={[currentStep]}
              onError={() => {
                toasts.error('An error occurred while loading photos step. Please try again.');
              }}
            >
              <StepPhotosOnly
                bind:formData
                bind:uploadedImages
                bind:isUploadingImages
                onImageUpload={handleImageUpload}
                onImageDelete={handleImageDelete}
                onFieldChange={() => {
                  // Could add validation here if needed
                }}
              />
            </ErrorBoundary>
          </div>
        {/if}

        <!-- Step 2: Category Selection -->
        {#if currentStep === 2}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 2 of 4: {i18n.sell_step2()}">
            <ErrorBoundary
              resetKeys={[currentStep]}
              onError={() => {
                toasts.error('An error occurred while loading category step. Please try again.');
              }}
            >
              <StepCategory
                categories={data.categories}
                bind:formData
                suggestions={categorySuggestions}
                showSuggestions={showSuggestions}
                onFieldChange={(field, value) => {
                  // Update category fields
                  if (field === 'gender') formData.gender_category_id = value as string;
                  if (field === 'type') formData.type_category_id = value as string;
                  if (field === 'specific') formData.category_id = value as string;
                  if (field === 'condition') formData.condition = value as typeof formData.condition;
                }}
                onDismissSuggestions={() => showSuggestions = false}
                onApplySuggestions={() => {
                  if (categorySuggestions) {
                    // Map suggestion to actual category IDs
                    if (categorySuggestions.gender) {
                      const genderCat = genderCategories.find((c: any) => c.name === categorySuggestions?.gender);
                      if (genderCat) {
                        formData.gender_category_id = genderCat.id;
                      }
                    }
                    if (categorySuggestions.type && formData.gender_category_id) {
                      const typeCat = typeCategories.find((c: any) => c.name === categorySuggestions?.type);
                      if (typeCat) {
                        formData.type_category_id = typeCat.id;
                      }
                    }
                    if (categorySuggestions.specific && formData.type_category_id) {
                      const specificCat = specificCategories.find((c: any) => c.name === categorySuggestions?.specific);
                      if (specificCat) {
                        formData.category_id = specificCat.id;
                      }
                    }
                    showSuggestions = false;
                    toasts.success('Applied category suggestions!');
                  }
                }}
              />
            </ErrorBoundary>
          </div>
        {/if}
        
        
        <!-- Step 3: Pricing (previously Step 4) -->
        {#if currentStep === 3}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 3 of 4: Pricing" class="space-y-4 animate-in fade-in slide-in-from-right duration-300">
            <ErrorBoundary
              resetKeys={[currentStep]}
              onError={() => {
                toasts.error('An error occurred while loading pricing step. Please try again.');
              }}
            >
              <StepPricing
                bind:formData
                profile={data.profile as any}
                {priceSuggestion}
                errors={{}}
                touched={{}}
                onFieldChange={() => {
                  // Could trigger price suggestion update here
                }}
                onFieldBlur={() => {
                  // Mark field as touched
                }}
              />
            </ErrorBoundary>
          </div>
        {/if}
        
        <!-- Step 4: Review (previously Step 5) -->
        {#if currentStep === 4}
          <div bind:this={stepContainer} tabindex="-1" role="region" aria-label="Step 4 of 4: Review listing" class="space-y-4 animate-in fade-in slide-in-from-right duration-300">
            <div class="bg-[color:var(--surface-base)] rounded-lg border border-[color:var(--border-subtle)] shadow-sm p-4">
              <div class="text-center mb-4">
                <h2 class="text-base font-semibold text-gray-900 mb-1">{i18n.sell_reviewListing()}</h2>
                <p class="text-sm text-gray-600">Everything look good? Your listing will appear like this:</p>
              </div>
              
              <!-- Compact Mobile Preview Card -->
              <div class="bg-[color:var(--surface-subtle)] rounded-lg border border-[color:var(--border-subtle)] overflow-hidden max-w-xs mx-auto shadow-sm">
                <!-- Image Gallery Preview -->
                {#if uploadedImages.length > 0 && uploadedImages[0]}
                  <div class="relative">
                    <img
                      src={uploadedImages[0].url}
                      alt={formData.title}
                      class="w-full h-40 object-cover"
                    />
                    {#if uploadedImages.length > 1}
                      <div class="absolute top-2 right-2 bg-[color:var(--overlay-high)] text-[color:var(--text-inverse)] text-xs px-1.5 py-0.5 rounded">
                        1/{uploadedImages.length}
                      </div>
                    {/if}
                  </div>
                {:else}
                  <div class="h-40 bg-[color:var(--surface-secondary)] flex items-center justify-center">
                    <p class="text-gray-500 text-sm">No images uploaded</p>
                  </div>
                {/if}

                <div class="p-3 space-y-2">
                  <!-- Category Breadcrumb -->
                  <div class="text-xs text-gray-500 uppercase tracking-wide line-clamp-1">
                    {#if genderCategories.find((c: any) => c.id === formData.gender_category_id)}
                      {genderCategories.find((c: any) => c.id === formData.gender_category_id)?.name}
                    {/if}
                    {#if typeCategories.find((c: any) => c.id === formData.type_category_id)}
                      › {typeCategories.find((c: any) => c.id === formData.type_category_id)?.name}
                    {/if}
                  </div>

                  <h3 class="font-semibold text-base line-clamp-2 leading-tight">{formData.title}</h3>

                  <!-- Price Section -->
                  <div class="flex items-start justify-between">
                    <div>
                      <span class="text-xl font-bold text-gray-900">${formData.price}</span>
                      {#if formData.shipping_cost > 0}
                        <div class="text-xs text-gray-500">+ ${formData.shipping_cost} shipping</div>
                      {:else if formData.shipping_cost === 0}
                        <div class="text-xs text-green-600 font-medium">Free shipping</div>
                      {/if}
                    </div>
                    <div class="text-right">
                      <div class="text-xs text-gray-500">You earn</div>
                      <div class="text-sm font-semibold text-green-600">${(formData.price * 0.9).toFixed(2)}</div>
                    </div>
                  </div>

                  <!-- Product Details - Compact -->
                  <div class="flex flex-wrap gap-1">
                    <span class="px-1.5 py-0.5 bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] text-xs rounded">{formData.brand}</span>
                    <span class="px-1.5 py-0.5 bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] text-xs rounded">Size {formData.size}</span>
                    <span class="px-1.5 py-0.5 bg-[color:var(--surface-base)] border border-[color:var(--border-subtle)] text-xs rounded capitalize">{formData.condition.replace('_', ' ').replace('-', ' ')}</span>
                  </div>

                  <!-- Description - Compact -->
                  {#if formData.description}
                    <p class="text-xs text-gray-600 leading-relaxed line-clamp-2">{formData.description}</p>
                  {/if}

                  <!-- Tags & Premium Boost - Compact Row -->
                  <div class="flex items-center justify-between">
                    <div class="flex flex-wrap gap-1">
                      {#if formData.tags && formData.tags.length > 0}
                        {#each formData.tags.slice(0, 2) as tag}
                          <span class="text-xs text-gray-500">#{tag}</span>
                        {/each}
                        {#if formData.tags.length > 2}
                          <span class="text-xs text-gray-400">+{formData.tags.length - 2}</span>
                        {/if}
                      {/if}
                    </div>

                    {#if formData.use_premium_boost}
                      <div class="flex items-center gap-1 px-2 py-1 bg-[color:var(--brand-primary-subtle)] rounded text-xs">
                        <svg class="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span class="text-purple-700 font-medium">Boosted</span>
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
              
              {#if publishError}
                <div class="mt-4 p-4 bg-[color:var(--status-error-subtle)] border border-[color:var(--status-error-border)] rounded-xl">
                  <p class="text-sm text-red-600">{publishError}</p>
                </div>
              {/if}
            </div>
          </div>
        {/if}

        <!-- CRITICAL: NO HIDDEN INPUTS - all data handled in enhance function -->
        </form>
      </div>

      <!-- Form Navigation - Above Bottom Nav -->
      {#if !showSuccess}
        <div class="sticky bottom-0 bg-[color:var(--surface-base)] border-t border-[color:var(--border-subtle)] px-4 py-3 sm:relative sm:border-0 sm:bg-transparent sm:px-0">
          <div class="max-w-lg mx-auto flex gap-3">
        {#if currentStep > 1}
          <button
            type="button"
            onclick={() => {
              publishError = null;
              setTimeout(() => {
                currentStep--;
                navigateToStep();
              }, 150);
            }}
            disabled={submitting}
            class="flex items-center justify-center gap-2 px-4 py-3 min-h-[var(--touch-primary)] rounded-lg border-2 border-[color:var(--border-primary)] bg-[color:var(--surface-base)] text-[color:var(--text-secondary)] font-medium hover:bg-[color:var(--surface-subtle)] hover:border-[color:var(--border-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
            aria-label="Go back to previous step"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>{i18n.common_back()}</span>
          </button>
        {/if}

        {#if currentStep < 4}
          <button
            type="button"
            onclick={() => {
              if ((currentStep === 1 && canProceedStep1) ||
                  (currentStep === 2 && canProceedStep2) ||
                  (currentStep === 3 && canProceedStep3)) {
                publishError = null;
                setTimeout(() => {
                  currentStep++;
                  navigateToStep();
                }, 150);
              } else {
                // Show specific validation message
                if (currentStep === 1) {
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
                  if (!formData.price || formData.price <= 0) {
                    showValidation('Please enter a price');
                  }
                }
              }
            }}
            disabled={submitting}
            class="flex items-center justify-center gap-2 px-4 py-3 min-h-[var(--touch-primary)] rounded-lg bg-[color:var(--brand-primary)] text-[color:var(--brand-primary-fg)] font-medium hover:bg-[color:var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
            aria-label="Continue to next step"
          >
            <span>{i18n.common_next()}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        {:else if currentStep === 4}
          <button
            type="button"
            onclick={() => {
              publishError = null;
              if (formElement) {
                formElement.requestSubmit();
              }
            }}
            disabled={submitting || !canSubmit}
            class="flex items-center justify-center gap-2 px-4 py-3 min-h-[var(--touch-primary)] rounded-lg bg-[color:var(--brand-primary)] text-[color:var(--brand-primary-fg)] font-medium hover:bg-[color:var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-1"
            aria-label="Publish your listing"
          >
            {#if submitting}
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{i18n.sell_publishing()}</span>
            {:else}
              <span>{i18n.sell_confirmPublish()}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            {/if}
          </button>
        {/if}
          </div>
        </div>
      {/if}
    {/if}
  </div>
    
  <!-- Success Screen -->
  {#if showSuccess}
    <div class="fixed inset-0 z-[100] flex items-center justify-center bg-[color:var(--surface-base)]">
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
          <div class="mb-6 bg-[color:var(--surface-subtle)] rounded-lg p-3 flex items-center gap-3">
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
            class="w-full px-4 py-3 bg-[color:var(--brand-primary)] text-[color:var(--brand-primary-fg)] rounded-lg font-medium hover:bg-[color:var(--brand-primary-hover)] transition-colors"
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
            class="w-full px-4 py-3 border-2 border-[color:var(--border-primary)] rounded-lg font-medium hover:bg-[color:var(--surface-subtle)] transition-colors"
          >
            {i18n.sell_listAnother()}
          </button>
        </div>
      </div>
    </div>
  {/if}
</div><style>
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
    line-clamp: 2;
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

  /* Mobile touch improvements */
  .sell-form-container {
    touch-action: manipulation;
  }
</style>

