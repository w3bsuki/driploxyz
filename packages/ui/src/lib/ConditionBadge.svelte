<script lang="ts">
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
      brandNewWithTags: 'BNWT',
      newWithoutTags: 'New',
      likeNew: 'Like New',
      good: 'Good',
      worn: 'Worn',
      fair: 'Fair'
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
    'brand_new_with_tags': 'bg-emerald-500/90 text-white md:backdrop-blur-sm',
    'new_without_tags': 'bg-green-500/90 text-white md:backdrop-blur-sm',
    'like_new': 'bg-blue-500/90 text-white md:backdrop-blur-sm',
    'good': 'bg-yellow-500/90 text-white md:backdrop-blur-sm',
    'worn': 'bg-orange-500/90 text-white md:backdrop-blur-sm',
    'fair': 'bg-red-500/90 text-white md:backdrop-blur-sm'
  };
</script>

<div class="px-1.5 py-0.5 {conditionColors[condition]} text-xs font-medium rounded uppercase tracking-wider">
  {conditionLabels[condition]}
</div>