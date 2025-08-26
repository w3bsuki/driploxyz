<script lang="ts">
  import { CollapsibleCategorySelector } from '@repo/ui';
  import * as i18n from '@repo/i18n';

  interface Props {
    categories: any[];
    formData: {
      gender?: string;
      type?: string;
      specific?: string;
      [key: string]: any;
    };
    onFieldChange: (field: string, value: any) => void;
  }

  let { 
    categories,
    formData = $bindable(),
    onFieldChange
  }: Props = $props();

  function handleGenderSelect(id: string) {
    onFieldChange('gender', id);
  }

  function handleTypeSelect(id: string) {
    onFieldChange('type', id);
  }

  function handleSpecificSelect(id: string) {
    onFieldChange('specific', id);
  }
</script>

<div class="space-y-4">
  <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
    <div class="text-center mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-2">
        {i18n.sell_categoryTitle()}
      </h2>
      <p class="text-sm text-gray-600">
        {i18n.sell_categoryDescription()}
      </p>
    </div>

    <CollapsibleCategorySelector
    {categories}
    bind:gender={formData.gender}
    bind:type={formData.type}
    bind:specific={formData.specific}
    onGenderSelect={handleGenderSelect}
    onTypeSelect={handleTypeSelect}
    onSpecificSelect={handleSpecificSelect}
    whoIsItForLabel={i18n.sell_whoIsItFor()}
    categoryLabel={i18n.sell_category()}
    translateCategory={(name) => {
      const translations = {
        // Level 1 - Gender
        'Men': i18n.category_men(),
        'Women': i18n.category_women(),
        'Kids': i18n.category_kids(),
        'Unisex': i18n.category_unisex(),
        // Level 2 - Type
        'Clothing': i18n.category_clothing(),
        'Shoes': i18n.category_shoes(),
        'Accessories': i18n.category_accessories(),
        'Bags': i18n.category_bags(),
        // Level 3 - Clothing Specific
        'T-Shirts': i18n.category_tshirts(),
        'Shirts': i18n.category_shirts(),
        'Jeans': i18n.category_jeans(),
        'Jackets': i18n.category_jackets(),
        'Jackets & Coats': i18n.category_jacketsCoats(),
        'Dresses': i18n.category_dresses(),
        'Skirts': i18n.category_skirts(),
        'Shorts': i18n.category_shorts(),
        'Hoodies': i18n.category_hoodies(),
        'Sweaters': i18n.category_sweatersHoodies(),
        'Sweaters & Hoodies': i18n.category_sweatersHoodies(),
        'Suits': i18n.category_suitsBlazers(),
        'Suits & Blazers': i18n.category_suitsBlazers(),
        'Pants & Trousers': i18n.category_pantsTrousers(),
        'Pants & Jeans': i18n.category_pantsJeans(),
        'Activewear': i18n.category_activewear(),
        'Swimwear': i18n.category_swimwear(),
        'Underwear': i18n.category_underwear(),
        'Lingerie': i18n.category_lingerie(),
        'Lingerie & Underwear': i18n.category_lingerie(),
        // Level 3 - Shoes Specific
        'Sneakers': i18n.category_sneakers(),
        'Boots': i18n.category_boots(),
        'Heels': i18n.category_heels(),
        'Flats': i18n.category_flats(),
        'Sandals': i18n.category_sandals(),
        'Athletic': i18n.category_activewear(),
        'Formal Shoes': i18n.category_formalShoes(),
        // Level 3 - Accessories Specific
        'Hats & Caps': i18n.category_hatsAndCaps(),
        'Belts': i18n.category_belts(),
        'Scarves': i18n.category_scarves(),
        'Sunglasses': i18n.category_sunglasses(),
        'Watches': i18n.category_watches(),
        'Jewelry': i18n.category_jewelry(),
        'Wallets': i18n.category_wallets(),
        'Ties': i18n.category_ties(),
        'Gloves': i18n.category_gloves(),
        // Level 3 - Bags Specific
        'Handbags': i18n.category_handbags(),
        'Backpacks': i18n.category_backpacks(),
        'Shoulder Bags': i18n.category_shoulderBags(),
        'Crossbody Bags': i18n.category_crossbodyBags(),
        'Clutches': i18n.category_clutches(),
        'Tote Bags': i18n.category_toteBags(),
        'Travel Bags': i18n.category_travelBags(),
        'Laptop Bags': i18n.category_laptopBags()
      };
      return translations[name] || name;
    }}
    includesText={i18n.sell_includes()}
    selectedText={i18n.sell_selected()}
    accessoriesListText={i18n.sell_accessoriesList()}
    beMoreSpecificLabel={i18n.sell_beMoreSpecific()}
    optionalText={i18n.sell_optional()}
    typeCategoryPlaceholder={i18n.sell_typeCategoryPlaceholder()}
    />
  </div>
</div>