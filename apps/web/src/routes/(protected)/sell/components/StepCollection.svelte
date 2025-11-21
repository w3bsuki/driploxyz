<script lang="ts">
  import { CollectionSelector } from '@repo/ui';
  // import * as i18n from '@repo/i18n';

  interface Collection {
    id: string;
    name: string;
    slug: string;
    description: string;
    collection_type: 'drip' | 'designer';
    is_featured: boolean;
  }

  interface Props {
    collections: Collection[];
    formData: {
      collection_id?: string;
      [key: string]: string | boolean | number | null | undefined;
    };
    onFieldChange: (field: string, value: string | null) => void;
    errors?: Record<string, string>;
    touched?: Record<string, boolean>;
  }

  let {
    collections = [],
    formData,
    onFieldChange,
    errors = {},
    // touched = {}
  }: Props = $props();
</script>

<div class="space-y-6">
  <!-- Step Header -->
  <div class="text-center space-y-2">
    <h2 class="text-xl font-bold text-gray-900">Choose a Collection</h2>
    <p class="text-gray-600 text-sm">
      Help buyers discover your item by selecting the most relevant collection
    </p>
  </div>

  <!-- Collection Selector -->
  <div class="space-y-4">
    <CollectionSelector
      {collections}
      selectedCollectionId={formData.collection_id}
      onCollectionChange={(collectionId) => onFieldChange('collection_id', collectionId)}
      error={errors.collection_id}
    />

    <!-- Helper Text -->
    <div class="bg-[var(--surface-brand-strong)]/5 border border-[var(--surface-brand-strong)]/20 rounded-lg p-4">
      <div class="flex items-start gap-3">
        <div class="text-[var(--brand-primary-strong)] flex-shrink-0 mt-0.5">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="text-sm">
          <div class="font-medium text-[color-mix(in_oklch,var(--brand-primary-strong)_70%,black_30%)] mb-1">Collection Benefits</div>
          <ul class="text-[color-mix(in_oklch,var(--brand-primary-strong)_90%,black_10%)] space-y-1">
            <li>• <strong>DRIP Collections</strong>: Featured in trending sections, potential admin curation</li>
            <li>• <strong>Designer Collections</strong>: Highlighted for luxury shoppers</li>
            <li>• <strong>General</strong>: Listed in standard marketplace categories</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Ensure consistent spacing */
  .space-y-6 > * + * {
    margin-top: 1.5rem;
  }


  .space-y-2 > * + * {
    margin-top: 0.5rem;
  }

  .space-y-1 > * + * {
    margin-top: 0.25rem;
  }
</style>