<script lang="ts">
  import { ImageUploaderSupabase, Input, CollapsibleCategorySelector } from '@repo/ui';
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
      <label class="text-sm font-medium text-gray-700 mb-1.5 block">
        {i18n.sell_title()} <span class="text-red-500">*</span>
      </label>
      <input
        type="text"
        placeholder={i18n.sell_titlePlaceholder()}
        bind:value={formData.title}
        maxlength="50"
        name="title"
        required
        class="w-full px-3 py-2 text-base sm:text-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-md"
      />
      <div class="flex items-center justify-between mt-1.5">
        <div class="text-[11px]">
          {#if formData.title.length < 3}
            <span class="text-red-600">{i18n.sell_minCharacters()}</span>
          {:else if formData.title.length < 15}
            <span class="text-yellow-600">{i18n.sell_addBrandSize()}</span>
          {:else}
            <span class="text-green-600">✓ {i18n.sell_good()}</span>
          {/if}
        </div>
        <span class="text-[11px] text-gray-500">{formData.title.length}/50</span>
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
        class="w-full px-3 py-2 text-base sm:text-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-md resize-none"
      ></textarea>
      <div class="text-[11px] text-gray-500 mt-1 text-right">
        {formData.description.length}/500
      </div>
    </div>
  </div>
  
        
        // Level 3 - Specific items
        'Activewear': i18n.category_activewear(),
        'Boots': i18n.category_boots(),
        'Dresses': i18n.category_dresses(),
        'Flats': i18n.category_flats(),
        'Formal Shoes': i18n.category_formalShoes(),
        'Heels': i18n.category_heels(),
        'Hoodies': i18n.category_hoodies(),
        'Jackets': i18n.category_jackets(),
        'Jackets & Coats': i18n.category_jacketsCoats(),
        'Jeans': i18n.category_jeans(),
        'Jewelry': i18n.category_jewelry(),
        'Lingerie & Underwear': i18n.category_lingerie(),
        'Pants & Jeans': i18n.category_pantsJeans(),
        'Pants & Trousers': i18n.category_pantsTrousers(),
        'Sandals': i18n.category_sandals(),
        'Sandals & Slides': i18n.category_sandalsSlides(),
        'Shirts': i18n.category_shirts(),
        'Shirts & Blouses': i18n.category_shirtsBlouses(),
        'Shorts': i18n.category_shorts(),
        'Skirts': i18n.category_skirts(),
        'Sneakers': i18n.category_sneakers(),
        'Suits & Blazers': i18n.category_suitsBlazers(),
        'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
        'Swimwear': i18n.category_swimwear(),
        'T-Shirts': i18n.category_tshirts(),
        'Tops & T-Shirts': i18n.category_topsTshirts(),
        'Underwear': i18n.category_underwear(),
        'Watches': i18n.category_watches(),
        'Hats & Caps': i18n.category_hatsAndCaps(),
        'Belts': i18n.category_belts(),
        'Scarves': i18n.category_scarves(),
        'Sunglasses': i18n.category_sunglasses(),
        'Wallets': i18n.category_wallets(),
        'Hair Accessories': i18n.category_hairAccessories(),
        'Ties': i18n.category_ties(),
        'Cufflinks': i18n.category_cufflinks(),
        'Backpacks': i18n.category_backpacks(),
        
        // Additional accessories
        'Wallets & Purses': i18n.category_walletsAndPurses(),
        'Gloves': i18n.category_gloves(),
        'Gloves & Mittens': i18n.category_glovesAndMittens(),
        'Shawls': i18n.category_shawls(),
        'Bandanas': i18n.category_bandanas(),
        'Bibs': i18n.category_bibs(),
        'Suspenders': i18n.category_suspenders(),
        'Keychains': i18n.category_keychains(),
        'Phone Cases': i18n.category_phoneCases(),
        'Pocket Squares': i18n.category_pocketSquares(),
        
        // Bag types
        'Handbags': i18n.category_handbags(),
        'Shoulder Bags': i18n.category_shoulderBags(),
        'Crossbody Bags': i18n.category_crossbodyBags(),
        'Clutches': i18n.category_clutches(),
        'Tote Bags': i18n.category_toteBags(),
        'Makeup Bags': i18n.category_makeupBags(),
        'Travel Bags': i18n.category_travelBags(),
        'Briefcases': i18n.category_briefcases(),
        'Messenger Bags': i18n.category_messengerBags(),
        'Gym Bags': i18n.category_gymBags(),
        'Duffel Bags': i18n.category_duffelBags(),
        'Laptop Bags': i18n.category_laptopBags(),
        'School Bags': i18n.category_schoolBags(),
        'Lunch Bags': i18n.category_lunchBags(),
        'Mini Bags': i18n.category_miniBags()
      };
      return categoryKeyMap[name] || name;
    }}
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
</div>