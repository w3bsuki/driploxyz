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
        'Men': i18n.category_men(),
        'Women': i18n.category_women(),
        'Kids': i18n.category_kids(),
        'Unisex': i18n.category_unisex(),
        'Clothing': i18n.category_clothing(),
        'Shoes': i18n.category_shoes(),
        'Accessories': i18n.category_accessories(),
        'Bags': i18n.category_bags()
      };
      return translations[name] || name;
    }}
    includesText={i18n.sell_includes()}
    selectedText={i18n.sell_selected()}
    accessoriesListText={i18n.sell_accessoriesList()}
  />
</div>