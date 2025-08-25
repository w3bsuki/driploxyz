<script lang="ts">
  import { ImageUploaderSupabase, Input, CategorySelector } from '@repo/ui';
  import type { Category } from '$lib/types/product';
  
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
      [key: string]: any;
    };
    uploadedImages: UploadedImage[];
    categories: Category[];
    isUploadingImages: boolean;
    onImageUpload: (images: UploadedImage[]) => void;
    onImageDelete: (index: number) => Promise<void>;
    onFieldChange: (field: string, value: any) => void;
  }
  
  let { 
    formData = $bindable(),
    uploadedImages = $bindable(),
    categories,
    isUploadingImages = $bindable(),
    onImageUpload,
    onImageDelete,
    onFieldChange
  }: Props = $props();
</script>

<div class="space-y-3 animate-in fade-in slide-in-from-right duration-300">
  <!-- Combined photo section header -->
  <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg px-3 py-2.5 border border-gray-200">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span class="text-sm font-medium text-gray-800">Photos</span>
        <span class="text-xs text-gray-500">• Natural light • All angles</span>
      </div>
      <span class="text-xs font-medium text-gray-600">
        {uploadedImages.length}/10
      </span>
    </div>
  </div>
  
  <div>
    <ImageUploaderSupabase
      maxImages={10}
      bind:images={uploadedImages}
      onUpload={onImageUpload}
      onDelete={onImageDelete}
      bind:uploading={isUploadingImages}
    />
  </div>
  
  <!-- Title Section -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <label class="text-sm font-medium text-gray-700 mb-1.5 block">What are you selling?</label>
    <input
      type="text"
      placeholder="e.g., Nike Air Max 90"
      bind:value={formData.title}
      maxlength="50"
      name="title"
      required
      class="w-full px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded-md bg-gray-50"
    />
    <div class="flex items-center justify-between mt-2">
      <div class="text-xs">
        {#if formData.title.length < 3}
          <span class="text-red-600">Min 3 characters</span>
        {:else if formData.title.length < 15}
          <span class="text-yellow-600">Add brand/size</span>
        {:else}
          <span class="text-green-600">✓ Good</span>
        {/if}
      </div>
      <span class="text-xs text-gray-500">{formData.title.length}/50</span>
    </div>
  </div>
  
  <!-- Visual Category Selector -->
  <CategorySelector
    {categories}
    bind:gender={formData.gender_category_id}
    bind:type={formData.type_category_id}
    bind:specific={formData.category_id}
    onGenderSelect={(id) => {
      formData.gender_category_id = id;
      formData.type_category_id = '';
      formData.category_id = '';
      onFieldChange('gender_category_id', id);
    }}
    onTypeSelect={(id) => {
      formData.type_category_id = id;
      formData.category_id = '';
      onFieldChange('type_category_id', id);
    }}
    onSpecificSelect={(id) => {
      formData.category_id = id;
      onFieldChange('category_id', id);
    }}
  />
  
  <!-- Hidden inputs for form submission -->
  <input type="hidden" name="gender_category_id" value={formData.gender_category_id} />
  <input type="hidden" name="type_category_id" value={formData.type_category_id} />
  <input type="hidden" name="category_id" value={formData.category_id} />
  
  <!-- Description Section -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3">
    <label for="description" class="text-sm font-medium text-gray-700 mb-1.5 block">
      Description <span class="text-gray-400 font-normal">(optional)</span>
    </label>
    <textarea
      id="description"
      name="description"
      bind:value={formData.description}
      placeholder="Size, fit, flaws, styling..."
      rows="2"
      class="w-full px-3 py-2 text-sm border-0 focus:ring-2 focus:ring-blue-500 rounded-md bg-gray-50 resize-none"
    ></textarea>
    <div class="text-xs text-gray-500 mt-1 text-right">
      {formData.description.length}/500
    </div>
  </div>
</div>