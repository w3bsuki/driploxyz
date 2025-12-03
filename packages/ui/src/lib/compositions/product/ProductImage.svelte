<script lang="ts">
  interface Props {
    product_images?: Array<{image_url: string}>;
    images?: Array<string | {image_url: string}>;
    alt: string;
    priority?: boolean;
    class?: string;
  }

  let { 
    product_images,
    images, 
    alt, 
    priority = false,
    class: className = ''
  }: Props = $props();

  // SVG placeholder as a data URI for when images fail to load
  const placeholderSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjgwMCIgdmlld0JveD0iMCAwIDgwMCA4MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI4MDAiIGZpbGw9IiNmM2Y0ZjYiLz48cGF0aCBkPSJNMzUwIDQyMGg1MHYzMGgtNTB2LTMwem01MCAwdjMwaC01MHYtMzBoNTB6bS0yNSA2NWMtMjUgMC01MC0xNS01MC00MHYtMjVoMTAwdjI1YzAgMjUtMjUgNDAtNTAgNDB6IiBmaWxsPSIjZDFkNWRiIi8+PHBhdGggZD0iTTMwMCAzMjBoMjAwdjE4MEgzMDBWMzIweiIgc3Ryb2tlPSIjZDFkNWRiIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz48L3N2Zz4=';

  // Track image load error state
  let hasError = $state(false);

  // Get image URL - reactive to prop changes
  const imageUrl = $derived(() => {
    if (hasError) {
      return placeholderSvg;
    }
    if (product_images?.[0]?.image_url) {
      return product_images[0].image_url;
    } else if (images?.[0]) {
      const firstImage = images[0];
      if (typeof firstImage === 'string') {
        return firstImage;
      } else if (firstImage?.image_url) {
        return firstImage.image_url;
      }
    }
    return placeholderSvg;
  });

  // Generate srcset for responsive loading
  const srcset = $derived(() => {
    const url = imageUrl();
    if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/') || hasError) return undefined;
    
    // Check if it's a Supabase URL
    if (url.includes('supabase.co/storage/v1/object/public')) {
      // Generate widths: 320w, 640w, 800w (max)
      // We don't go above 800 because the source is 800x800
      return `
        ${url}?width=320&format=webp 320w,
        ${url}?width=640&format=webp 640w,
        ${url}?width=800&format=webp 800w
      `;
    }
    
    return undefined;
  });

  // Handle image load errors
  function handleError() {
    hasError = true;
  }

  // Reset error state when images prop changes
  $effect(() => {
    // Access both props to create dependency
    const _ = product_images;
    const __ = images;
    hasError = false;
  });
</script>

<div class="relative w-full h-full bg-(--surface-subtle) overflow-hidden {className}">
  <!-- Images are already WebP optimized during upload - no runtime transformations needed -->
  <img
    src={imageUrl()}
    srcset={srcset()}
    {alt}
    loading={priority ? "eager" : "lazy"}
    fetchpriority={priority ? "high" : "auto"}
    decoding="async"
    class="w-full h-full object-cover"
    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
    onerror={handleError}
  />
</div>
