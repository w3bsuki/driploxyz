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

<div class="space-y-6 animate-in fade-in slide-in-from-right duration-300 min-h-[60vh]">
  <div>
    <h2 class="text-2xl font-bold text-gray-900 mb-2">Add Photos</h2>
    <p class="text-gray-600">Good photos sell items faster</p>
  </div>
  
  <!-- Photo Tips -->
  <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
    <h4 class="font-medium text-blue-900 mb-2">📸 Photo Tips</h4>
    <ul class="text-sm text-blue-700 space-y-1">
      <li>• Natural lighting works best</li>
      <li>• Show all angles & flaws</li>
      <li>• Include brand/size tags</li>
      <li>• First photo = main image</li>
    </ul>
  </div>
  
  <div>
    <ImageUploaderSupabase
      maxImages={10}
      bind:images={uploadedImages}
      onUpload={onImageUpload}
      onDelete={onImageDelete}
      bind:uploading={isUploadingImages}
    />
    <div class="flex items-center justify-between text-sm mt-2">
      <span class="text-gray-600">
        {uploadedImages.length}/10 photos
      </span>
      {#if uploadedImages.length === 0}
        <span class="text-red-600">Required</span>
      {:else}
        <span class="text-green-600">✓ Ready</span>
      {/if}
    </div>
  </div>
  
  <div>
    <Input
      type="text"
      label="What are you selling?"
      placeholder="e.g., Nike Air Max 90"
      bind:value={formData.title}
      maxlength={50}
      name="title"
      required
    />
    <div class="flex items-center justify-between mt-1">
      <div class="text-xs">
        {#if formData.title.length < 3}
          <span class="text-red-600">Min 3 characters</span>
        {:else if formData.title.length < 15}
          <span class="text-yellow-600">Add brand/size for visibility</span>
        {:else}
          <span class="text-green-600">✓ Great title!</span>
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
  
  <div>
    <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
      Description (optional)
    </label>
    <textarea
      id="description"
      name="description"
      bind:value={formData.description}
      placeholder="Add details about size, fit, flaws, or styling suggestions..."
      rows="3"
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
    ></textarea>
    <div class="text-xs text-gray-500 mt-1 text-right">
      {formData.description.length}/500
    </div>
  </div>
</div>