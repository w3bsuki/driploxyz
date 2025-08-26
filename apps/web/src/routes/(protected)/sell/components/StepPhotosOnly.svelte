<script lang="ts">
  import { ImageUploaderSupabase, Input } from '@repo/ui';
  import * as i18n from '@repo/i18n';

  interface Props {
    formData: any;
    uploadedImages: Array<{ url: string; path: string }>;
    isUploadingImages: boolean;
    onImageUpload: (imageUrls: string[], imagePaths: string[]) => void;
    onImageDelete: (index: number) => Promise<void>;
    onFieldChange: (field: string, value: any) => void;
  }

  let { 
    formData = $bindable(),
    uploadedImages = $bindable(),
    isUploadingImages = $bindable(),
    onImageUpload,
    onImageDelete,
    onFieldChange
  }: Props = $props();
</script>

<div class="space-y-6">
  <!-- Upload Photos Section -->
  <div>
    <h3 class="text-base font-semibold text-gray-900 mb-1">{i18n.sell_uploadPhotos()}</h3>
    <p class="text-sm text-gray-600 mb-4">{i18n.sell_uploadPhotosDescription()}</p>
    
    <ImageUploaderSupabase
      bind:uploadedImages
      maxImages={8}
      onUpload={onImageUpload}
      onDelete={onImageDelete}
      bind:isUploading={isUploadingImages}
      uploadText={i18n.sell_uploadText()}
      maxImagesText={i18n.sell_maxImagesText()}
      dragDropText={i18n.sell_dragDropText()}
    />
  </div>

  <!-- Title & Description -->
  <div class="space-y-4">
    <Input
      type="text"
      label={i18n.sell_titleLabel()}
      bind:value={formData.title}
      placeholder={i18n.sell_titlePlaceholder()}
      required
      name="title"
      maxlength={100}
    />
    <div class="text-xs text-gray-500 -mt-2 text-right">
      {formData.title.length}/100
    </div>
    
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">
        {i18n.sell_descriptionLabel()}
      </label>
      <textarea
        bind:value={formData.description}
        placeholder={i18n.sell_descriptionPlaceholder()}
        rows="4"
        maxlength="500"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none text-sm"
      />
      <div class="text-[11px] text-gray-500 mt-1 text-right">
        {formData.description.length}/500
      </div>
    </div>
  </div>
</div>