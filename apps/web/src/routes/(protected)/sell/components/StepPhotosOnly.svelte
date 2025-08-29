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

<div class="space-y-4">
  <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
    <!-- Upload Photos Section -->
    <div class="mb-6">
      <h3 class="text-base font-semibold text-gray-900 mb-1">{i18n.sell_photos()}</h3>
      <p class="text-sm text-gray-600 mb-4">{i18n.sell_uploadPhotos_description()}</p>
      
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

    <!-- Title & Description -->
    <div class="space-y-4">
      <Input
      type="text"
      label={i18n.sell_title()}
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
        {i18n.sell_description()}
      </label>
      <textarea
        bind:value={formData.description}
        placeholder={i18n.sell_descriptionPlaceholder()}
        rows="4"
        maxlength="500"
        class="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 resize-none text-base sm:text-sm"
      />
      <div class="text-xs text-gray-500 mt-1 text-right">
        {formData.description.length}/500
      </div>
    </div>
    </div>
  </div>
</div>