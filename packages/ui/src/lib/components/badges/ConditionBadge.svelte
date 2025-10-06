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

{#if condition === 'brand_new_with_tags'}
  <span class="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">{conditionLabels[condition]}</span>
{:else if condition === 'new_without_tags'}
  <span class="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-wide bg-sky-50 text-sky-700 border border-sky-200">{conditionLabels[condition]}</span>
{:else if condition === 'like_new'}
  <span class="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-700 border border-indigo-200">{conditionLabels[condition]}</span>
{:else if condition === 'good'}
  <span class="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-wide bg-amber-50 text-amber-700 border border-amber-200">{conditionLabels[condition]}</span>
{:else if condition === 'worn'}
  <span class="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-wide bg-rose-50 text-rose-700 border border-rose-200">{conditionLabels[condition]}</span>
{:else}
  <span class="inline-flex items-center px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-semibold uppercase tracking-wide bg-gray-100 text-gray-800 border border-gray-200">{conditionLabels[condition]}</span>
{/if}