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

  const label = $derived(conditionLabels[condition]);
</script>

<span class="condition-badge condition-badge--{condition}">
  {label}
</span>

<style>
  /* 
    Condition Badge - Tailwind CSS v4 + Svelte 5 Best Practices
    - Uses Tailwind v4 design tokens exclusively
    - WCAG AA compliant (4.5:1 contrast minimum)
    - Touch-friendly sizing (min 24px height)
    - Optimal readability with proper spacing
  */
  
  .condition-badge {
    /* Layout */
    display: inline-flex;
    align-items: center;
    
    /* Sizing - Optimal for readability & touch */
  padding: var(--condition-badge-padding-y) var(--condition-badge-padding-x);
    min-height: var(--touch-minimum); /* 24px - WCAG AAA */
    
    /* Typography - Tailwind v4 tokens */
  font-size: var(--condition-badge-font-size);
    line-height: var(--leading-none); /* 1 - tight vertical */
    font-weight: var(--font-semibold); /* 600 - better than 500 */
  letter-spacing: var(--condition-badge-letter-spacing);
    text-transform: uppercase;
    
    /* Visual */
  border-radius: var(--condition-badge-radius); /* keep in sync with product card corners */
    
    /* Transitions */
    transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  /* Brand New with Tags - Vibrant Green */
  .condition-badge--brand_new_with_tags {
    background-color: var(--condition-new-bg);
    color: var(--condition-new-text);
  }
  
  /* New Without Tags - Premium Blue */
  .condition-badge--new_without_tags {
    background-color: var(--condition-newwithout-bg);
    color: var(--condition-newwithout-text);
  }
  
  /* Like New - Indigo Blue */
  .condition-badge--like_new {
    background-color: var(--condition-likenew-bg);
    color: var(--condition-likenew-text);
  }
  
  /* Good - Warm Orange */
  .condition-badge--good {
    background-color: var(--condition-good-bg);
    color: var(--condition-good-text);
  }
  
  /* Worn - Deep Red */
  .condition-badge--worn {
    background-color: var(--condition-worn-bg);
    color: var(--condition-worn-text);
  }
  
  /* Fair - Cool Gray */
  .condition-badge--fair {
    background-color: var(--condition-fair-bg);
    color: var(--condition-fair-text);
  }
</style>
