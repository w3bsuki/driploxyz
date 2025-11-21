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

  // Get image URL - reactive to prop changes
  const imageUrl = $derived(() => {
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
    return '/placeholder-product.svg';
  });

  // Generate srcset for responsive loading
  const srcset = $derived(() => {
    const url = imageUrl();
    if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('/')) return undefined;
    
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
  />
</div>
