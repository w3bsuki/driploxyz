<script lang="ts">
  import { ImageUploaderSupabase, Input } from '@repo/ui';
  import * as i18n from '@repo/i18n';

  interface Props {
    formData: Record<string, string | boolean | number | null | undefined>;
    uploadedImages: Array<{ url: string; path: string }>;
    isUploadingImages: boolean;
    onImageUpload: (imageUrls: string[], imagePaths: string[]) => void;
    onImageDelete: (index: number) => Promise<void>;
    onFieldChange: (field: string, value: string | boolean | number | null | undefined) => void;
  }

  let { 
    formData = $bindable(),
    uploadedImages = $bindable(),
    isUploadingImages = $bindable(),
    onImageUpload,
    onImageDelete,
    // onFieldChange
  }: Props = $props();
</script>

<div class="space-y-4">
  <div class="bg-[color:var(--surface-base)] rounded-xl border border-[color:var(--border-subtle)] shadow-sm p-4 sm:p-5">
    <!-- Upload Photos Section -->
    <div class="mb-5">
      <h3 class="text-lg font-semibold text-[color:var(--text-primary)] mb-1">{i18n.sell_photos()}</h3>
      <p class="text-sm text-[color:var(--text-tertiary)] mb-4">{i18n.sell_uploadPhotos_description()}</p>
      
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
    <div class="space-y-5 pt-1 border-t border-[color:var(--border-subtle)]">
      <div>
        <Input
          type="text"
          label={i18n.sell_title()}
          bind:value={formData.title}
          placeholder={i18n.sell_titlePlaceholder()}
          required
          name="title"
          maxlength={100}
        />
        <div class="text-xs text-[color:var(--text-quaternary)] mt-1 text-right">
          {formData.title.length}/100
        </div>
      </div>
    
      <div>
        <label for="product-description" class="block text-sm font-medium text-[color:var(--text-primary)] mb-2">
          {i18n.sell_description()}
        </label>
        <textarea
          id="product-description"
          bind:value={formData.description}
          placeholder={i18n.sell_descriptionPlaceholder()}
          rows="4"
          maxlength="500"
          class="w-full px-4 py-3 border border-[color:var(--border-subtle)] rounded-xl focus:ring-2 focus:ring-[color:var(--focus-ring)] focus:border-[color:var(--border-focus)] resize-none text-base text-[16px] transition-colors bg-[color:var(--surface-base)] text-[color:var(--text-primary)]"
        ></textarea>
        <div class="text-xs text-[color:var(--text-quaternary)] mt-1 text-right">
          {formData.description.length}/500
        </div>
      </div>
    </div>
  </div>
</div>