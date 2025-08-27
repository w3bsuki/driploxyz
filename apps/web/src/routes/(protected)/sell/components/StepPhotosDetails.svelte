<script lang="ts">
  import { ImageUploaderSupabase, Input, Select } from '@repo/ui';
  import type { Category } from '$lib/types/product';
  import * as i18n from '@repo/i18n';
  
  interface UploadedImage {
    url: string;
    path: string;
  }
  
  interface Props {
    formData: {
      title: string;
      description: string;
      gender_category_id: string;
      type_category_id: string;
      category_id: string;
    };
    uploadedImages: UploadedImage[];
    categories: Category[];
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    isUploadingImages: boolean;
    onImageUpload: (files: File[]) => Promise<UploadedImage[]>;
    onImageDelete: (path: string) => Promise<boolean>;
    onFieldChange: (field: string, value: any) => void;
    onFieldBlur: (field: string) => void;
  }
  
  let { 
    formData = $bindable(),
    uploadedImages = $bindable(),
    categories,
    errors,
    touched,
    isUploadingImages = $bindable(),
    onImageUpload,
    onImageDelete,
    onFieldChange,
    onFieldBlur
  }: Props = $props();
  
  // Computed values for 3-tier category system
  const genderCategories = $derived(
    categories?.filter(cat => !cat.parent_id) || []
  );

  const typeCategories = $derived(
    formData.gender_category_id 
      ? categories?.filter(cat => cat.parent_id === formData.gender_category_id) || []
      : []
  );

  const specificCategories = $derived(
    formData.type_category_id
      ? categories?.filter(cat => cat.parent_id === formData.type_category_id) || []
      : []
  );
  
  function showError(field: string): boolean {
    return touched[field] && !!errors[field];
  }
</script>

<div class="space-y-3">
  <!-- Image Upload -->
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1.5">
{i18n.sell_photosSection()} <span class="text-red-500">*</span>
    </label>
    <ImageUploaderSupabase
      maxImages={10}
      bind:images={uploadedImages}
      onUpload={onImageUpload}
      onDelete={onImageDelete}
      bind:uploading={isUploadingImages}
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
      label="{i18n.sell_titleFieldLabel()}"
      placeholder="{i18n.sell_whatAreYouSelling()}"
      bind:value={formData.title}
      error={showError('title') ? errors.title : ''}
      required
      maxlength={50}
      onblur={() => onFieldBlur('title')}
      name="title"
    />
  </div>

  <!-- Gender/Age Category -->
  <div>
    <Select
      label="{i18n.sell_whoIsThisFor()}"
      bind:value={formData.gender_category_id}
      error={showError('gender_category_id') ? errors.gender_category_id : ''}
      required
      onchange={() => {
        onFieldChange('gender_category_id', formData.gender_category_id);
        formData.type_category_id = '';
        formData.category_id = '';
      }}
      name="gender_category_id"
    >
      <option value="">{i18n.sell_selectGenderAge()}</option>
      {#each genderCategories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </Select>
  </div>

  <!-- Product Type Category -->
  {#if typeCategories.length > 0}
    <div>
      <Select
        label="{i18n.sell_whatTypeOfProduct()}"
        bind:value={formData.type_category_id}
        error={showError('type_category_id') ? errors.type_category_id : ''}
        required
        onchange={() => {
          onFieldChange('type_category_id', formData.type_category_id);
          formData.category_id = '';
        }}
        name="type_category_id"
      >
        <option value="">{i18n.sell_selectProductType()}</option>
        {#each typeCategories as category}
          <option value={category.id}>{category.name}</option>
        {/each}
      </Select>
    </div>
  {/if}

  <!-- Specific Category -->
  {#if specificCategories.length > 0}
    <div>
      <Select
        label="{i18n.sell_specificCategoryLabel()}"
        bind:value={formData.category_id}
        error={showError('category_id') ? errors.category_id : ''}
        required
        onchange={() => onFieldChange('category_id', formData.category_id)}
        name="category_id"
      >
        <option value="">{i18n.sell_whatExactlyIsIt()}</option>
        {#each specificCategories as category}
          <option value={category.id}>{category.name}</option>
        {/each}
      </Select>
    </div>
  {/if}

  <!-- Description -->
  <div>
    <label for="description" class="block text-sm font-medium text-gray-700 mb-1">
{i18n.sell_descriptionOptional()}
    </label>
    <textarea
      id="description"
      name="description"
      bind:value={formData.description}
      placeholder="{i18n.sell_addDetailsPlaceholder()}"
      rows="3"
      maxlength="500"
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
    />
    <p class="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
  </div>
</div>