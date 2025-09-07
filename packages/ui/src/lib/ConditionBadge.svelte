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
  
  const conditionColors = {
    'brand_new_with_tags': 'bg-emerald-500 text-white',
    'new_without_tags': 'bg-emerald-500 text-white',
    'like_new': 'bg-cyan-500 text-white',
    'good': 'bg-amber-500 text-white',
    'worn': 'bg-orange-500 text-white', 
    'fair': 'bg-red-500 text-white'
  };
</script>

<span class="inline-flex items-center px-1 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide shadow-sm backdrop-blur-sm bg-white/85 text-gray-800 border border-gray-200">
  <span class="inline-block w-1.5 h-1.5 rounded-full mr-1.5 {condition === 'brand_new_with_tags' || condition === 'new_without_tags' ? 'bg-emerald-500' : condition === 'like_new' ? 'bg-cyan-500' : condition === 'good' ? 'bg-amber-500' : condition === 'worn' ? 'bg-orange-500' : 'bg-red-500'}"></span>
  {conditionLabels[condition]}
</span>