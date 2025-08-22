<script lang="ts">
  interface Props {
    src: string;
    alt: string;
    class?: string;
    aspectRatio?: 'square' | 'auto';
    loading?: 'lazy' | 'eager';
    placeholder?: string;
    sizes?: string;
    onclick?: () => void;
    showSkeleton?: boolean;
    fetchpriority?: 'high' | 'low' | 'auto';
    width?: number;
    quality?: number;
  }

  let { 
    src,
    alt,
    class: className = '',
    aspectRatio = 'auto',
    loading = 'eager',
    placeholder = '/placeholder-product.svg',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    onclick,
    showSkeleton = false,
    fetchpriority = 'auto',
    width = 800,
    quality = 75
  }: Props = $props();

  // Generate WebP URL from Supabase
  function getOptimizedUrl(originalSrc: string): string {
    if (!originalSrc || originalSrc === placeholder) return originalSrc;
    
    // If it's a Supabase URL, add transformation parameters for WebP
    if (originalSrc.includes('supabase.co')) {
      const url = new URL(originalSrc);
      // Supabase Storage supports on-the-fly transformations
      url.searchParams.set('width', width.toString());
      url.searchParams.set('quality', quality.toString());
      url.searchParams.set('format', 'webp');
      return url.toString();
    }
    
    return originalSrc;
  }

  const optimizedSrc = $derived(getOptimizedUrl(src));
</script>

<div class="relative overflow-hidden {aspectRatio === 'square' ? 'aspect-square' : ''} {onclick ? 'cursor-pointer' : ''} {className}">
  <picture>
    <!-- WebP version -->
    <source 
      srcset={optimizedSrc}
      type="image/webp"
      {sizes}
    />
    <!-- Fallback to original -->
    <img
      src={src || placeholder}
      {alt}
      {sizes}
      {loading}
      decoding="async"
      {fetchpriority}
      class="w-full h-full object-cover"
      style="display: block !important;"
    />
  </picture>
</div>