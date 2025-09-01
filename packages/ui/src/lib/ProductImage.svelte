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
</script>

<div class="relative aspect-square bg-[color:var(--surface-subtle)] overflow-hidden rounded-lg {className}">
  <!-- Images are already WebP optimized during upload - no runtime transformations needed -->
  <img
    src={imageUrl()}
    {alt}
    loading={priority ? "eager" : "lazy"}
    fetchpriority={priority ? "high" : "auto"}
    decoding="async"
    class="w-full h-full object-cover"
    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
  />
</div>
