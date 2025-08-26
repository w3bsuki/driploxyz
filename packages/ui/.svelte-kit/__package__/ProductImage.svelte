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

  // Get image URL - completely static, no reactivity
  let imageUrl = '/placeholder-product.svg';
  
  if (product_images?.[0]?.image_url) {
    imageUrl = product_images[0].image_url;
  } else if (images?.[0]) {
    const firstImage = images[0];
    if (typeof firstImage === 'string') {
      imageUrl = firstImage;
    } else if (firstImage?.image_url) {
      imageUrl = firstImage.image_url;
    }
  }
</script>

<div class="relative aspect-square bg-gray-50 overflow-hidden rounded-lg {className}">
  <img
    src={imageUrl}
    {alt}
    loading={priority ? "eager" : "lazy"}
    fetchpriority={priority ? "high" : "auto"}
    class="w-full h-full object-cover"
    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
  />
</div>