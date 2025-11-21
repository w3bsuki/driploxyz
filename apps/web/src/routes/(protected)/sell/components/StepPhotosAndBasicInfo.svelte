<script lang="ts">
  import { ImageUploaderSupabase } from '@repo/ui';
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
      [key: string]: string | boolean | number | null | undefined;
    };
    uploadedImages: UploadedImage[];
    categories: Category[];
    isUploadingImages: boolean;
  onImageUpload: (files: File[]) => Promise<UploadedImage[]>;
  onImageDelete: (path: string) => Promise<boolean>;
    onFieldChange: (field: string, value: string | boolean | number | null | undefined) => void;
  }
  
  let {
    formData = $bindable(),
    uploadedImages = $bindable(),
    // categories,
    isUploadingImages = $bindable(),
    onImageUpload,
    onImageDelete
  }: Props = $props();
</script>

<div class="space-y-4 animate-in fade-in slide-in-from-right duration-300">
  <!-- Photos Section - Cleaner header -->
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-medium text-gray-900 flex items-center gap-1.5">
        <span class="text-base">📸</span>
        {i18n.sell_photos()}
        <span class="text-xs text-gray-500">({uploadedImages.length}/10)</span>
      </h3>
    </div>
    
    <ImageUploaderSupabase
      maxImages={10}
      bind:images={uploadedImages}
      onUpload={onImageUpload}
      onDelete={onImageDelete}
      bind:uploading={isUploadingImages}
      helpText={i18n.sell_uploadJPGPNG()}
      uploadingImagesText={i18n.sell_uploadingImages()}
      imagesOptimizedText={i18n.sell_imagesOptimized()}
      dropHereText={i18n.sell_dropHere()}
      addPhotoText={i18n.sell_addPhoto()}
      coverText={i18n.sell_cover()}
      removeImageText={i18n.sell_removeImage()}
      photosUploadedText={(count) => i18n.sell_photosUploaded({ count, s: count === 1 ? '' : 's' })}
      moreAllowedText={(count) => i18n.sell_moreAllowed({ count })}
      optimizedForWebText={i18n.sell_optimizedForWeb()}
    />
  </div>
  
  <!-- Title & Description - Combined Section -->
  <div class="bg-white rounded-lg border-2 border-gray-200 p-3 space-y-3">
    <div>
      <label for="title" class="text-sm font-medium text-gray-700 mb-1.5 block">
        {i18n.sell_title()} <span class="text-red-500">*</span>
      </label>
      <input
        id="title"
        type="text"
        placeholder={i18n.sell_titlePlaceholder()}
        bind:value={formData.title}
        maxlength="50"
        name="title"
        required
        class="w-full px-3 py-2 text-base sm:text-sm border border-gray-200 focus:ring-2 focus:ring-[color:var(--state-focus)] rounded-md"
      />
      <div class="flex items-center justify-between mt-1.5">
        <div class="text-xs">
          {#if formData.title.length < 3}
            <span class="text-red-600">{i18n.sell_minCharacters()}</span>
          {:else if formData.title.length < 15}
            <span class="text-yellow-600">{i18n.sell_addBrandSize()}</span>
          {:else}
            <span class="text-green-600">✓ {i18n.sell_good()}</span>
          {/if}
        </div>
        <span class="text-xs text-gray-500">{formData.title.length}/50</span>
      </div>
    </div>
    
    <div>
      <label for="description" class="text-sm font-medium text-gray-700 mb-1.5 block">
        {i18n.sell_description()} <span class="text-gray-400 text-xs">{i18n.sell_optional()}</span>
      </label>
      <textarea
        id="description"
        name="description"
        bind:value={formData.description}
        placeholder={i18n.sell_descriptionPlaceholder()}
        rows="3"
        class="w-full px-3 py-2 text-base sm:text-sm border border-gray-200 focus:ring-2 focus:ring-[var(--state-focus)] rounded-md resize-none"
      ></textarea>
      <div class="text-xs text-gray-500 mt-1 text-right">
        {formData.description.length}/500
      </div>
    </div>
  </div>
  
  <!-- Hidden inputs for form submission -->
  <input type="hidden" name="gender_category_id" value={formData.gender_category_id} />
  <input type="hidden" name="type_category_id" value={formData.type_category_id} />
  <input type="hidden" name="category_id" value={formData.category_id} />
</div>