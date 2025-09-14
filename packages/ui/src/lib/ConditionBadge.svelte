<script lang="ts">
  import * as i18n from '@repo/i18n';
  const m: any = i18n;
  type ConditionType = 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
  
  interface Props {
    condition: ConditionType;
    translations?: {
      brandNewWithTags?: string;
      newWithoutTags?: string;
      likeNew?: string;
      good?: string;
      worn?: string;
      fair?: string;
    };
  }

  let { 
    condition,
    translations = {
      brandNewWithTags: m.product_newWithTags?.() ?? 'BNWT',
      newWithoutTags: m.product_new?.() ?? 'New',
      likeNew: m.product_likeNew?.() ?? 'Like New',
      good: m.product_good?.() ?? 'Good',
      worn: m.sell_condition_worn?.() ?? 'Worn',
      fair: m.product_fair?.() ?? 'Fair'
    }
  }: Props = $props();

  const conditionLabels = {
    'brand_new_with_tags': translations.brandNewWithTags || 'BNWT',
    'new_without_tags': translations.newWithoutTags || 'New',
    'like_new': translations.likeNew || 'Like New',
    'good': translations.good || 'Good',
    'worn': translations.worn || 'Worn',
    'fair': translations.fair || 'Fair'
  };
</script>

<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-800 uppercase tracking-wide">
  {conditionLabels[condition]}
</span>