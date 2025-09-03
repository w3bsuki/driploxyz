<script lang="ts">
	import type { Product, Profile } from '@repo/ui/types';
	import * as i18n from '@repo/i18n';
	
	interface Props {
		title: string;
		description: string;
		url?: string;
		image?: string;
		type?: 'website' | 'article' | 'product';
		product?: Product;
		seller?: Profile;
		keywords?: string[];
		noindex?: boolean;
		canonical?: string;
		preloadImages?: string[];
		enableImageOptimization?: boolean;
	}
	
	let {
		title,
		description,
		url = '',
		image = '/og-default.jpg',
		type = 'website',
		product,
		seller,
		keywords = [],
		noindex = false,
		canonical,
		preloadImages = [],
		enableImageOptimization = true
	}: Props = $props();
	
	// Get current locale
	const currentLocale = i18n.getLocale();
	
	// Generate locale-aware URLs for hreflang
	const getLocaleUrl = (locale: string, path: string = url) => {
		// For Bulgarian (default), no prefix
		if (locale === 'bg') {
			return `https://driplo.xyz${path}`;
		}
		// For English, use /uk prefix
		if (locale === 'en') {
			return `https://driplo.xyz/uk${path}`;
		}
		return `https://driplo.xyz${path}`;
	};
	
	// Generate full URL with locale prefix if needed
	const fullUrl = $derived(() => {
		if (url) {
			return getLocaleUrl(currentLocale, url);
		}
		return getLocaleUrl(currentLocale, '');
	});
	const fullImageUrl = $derived(
		image && typeof image === 'string' && image.startsWith('http') 
			? image 
			: `https://driplo.xyz${image || '/default-og-image.jpg'}`
	);

	// Generate optimized image sources for preloading
	function generateOptimizedImageUrl(imageUrl: string, width: number, quality: number = 85): string {
		if (!enableImageOptimization) return imageUrl;
		
		// For Supabase storage, generate optimized variants
		if (imageUrl.includes('supabase')) {
			const baseUrl = imageUrl.split('?')[0];
			return `${baseUrl}?width=${width}&quality=${quality}`;
		}
		
		// For other sources, return as-is
		return imageUrl;
	}

	// Get critical images for preloading (first product image + hero images)
	const criticalImages = $derived(() => {
		const images = [];
		
		// Add main product image (optimized for mobile and desktop)
		if (product?.images?.[0]) {
			const mainImage = typeof product.images[0] === 'string' 
				? product.images[0] 
				: product.images[0].image_url || product.images[0];
					
			if (typeof mainImage === 'string') {
				// Mobile-first: preload smaller version
				images.push({
					url: generateOptimizedImageUrl(mainImage, 600, 80),
					media: '(max-width: 768px)',
					as: 'image' as const,
					fetchpriority: 'high' as const
				});
				
				// Desktop: preload larger version
				images.push({
					url: generateOptimizedImageUrl(mainImage, 1200, 85),
					media: '(min-width: 769px)',
					as: 'image' as const,
					fetchpriority: 'high' as const
				});
			}
		}
		
		// Add any additional preload images passed in
		preloadImages.forEach(img => {
			images.push({
				url: img,
				as: 'image' as const,
				fetchpriority: 'high' as const
			});
		});
		
		return images;
	});

	// Generate preconnect hints for image domains
	const preconnectDomains = $derived(() => {
		const domains = new Set<string>();
		
		// Add product image domains
		if (product?.images) {
			product.images.forEach(img => {
				const imageUrl = typeof img === 'string' ? img : img?.image_url;
				if (imageUrl && typeof imageUrl === 'string') {
					try {
						const url = new URL(imageUrl);
						domains.add(url.origin);
					} catch (e) {
						// Skip invalid URLs
					}
				}
			});
		}
		
		// Add seller avatar domain
		if (seller?.avatar_url) {
			try {
				const url = new URL(seller.avatar_url);
				domains.add(url.origin);
			} catch (e) {
				// Skip invalid URLs  
			}
		}
		
		return Array.from(domains);
	});
	
	// Generate product-specific meta tags
	const productPrice = $derived(product ? `${product.currency || '€'}${product.price}` : '');
	const availability = $derived(product?.sold ? 'out of stock' : 'in stock');
	
	// Generate JSON-LD structured data for product
	const jsonLd = $derived(() => {
		if (!product) return null;
		
		return {
			'@context': 'https://schema.org/',
			'@type': 'Product',
			name: product.title,
			description: product.description || description,
			image: product.images?.map(img => 
				typeof img === 'string' && img.startsWith('http') ? img : `https://driplo.xyz${img}`
			) || [fullImageUrl],
			offers: {
				'@type': 'Offer',
				url: fullUrl,
				priceCurrency: product.currency || 'EUR',
				price: product.price,
				availability: `https://schema.org/${availability === 'in stock' ? 'InStock' : 'OutOfStock'}`,
				itemCondition: getConditionSchema(product.condition),
				seller: seller ? {
					'@type': 'Person',
					name: seller.display_name || seller.username
				} : undefined
			},
			brand: product.brand ? {
				'@type': 'Brand',
				name: product.brand
			} : undefined,
			category: product.category_name,
			aggregateRating: seller?.rating ? {
				'@type': 'AggregateRating',
				ratingValue: seller.rating,
				reviewCount: seller.reviews_count
			} : undefined
		};
	});
	
	function getConditionSchema(condition?: string) {
		const conditionMap: Record<string, string> = {
			'new': 'https://schema.org/NewCondition',
			'like_new': 'https://schema.org/LikeNewCondition',
			'good': 'https://schema.org/UsedCondition',
			'fair': 'https://schema.org/UsedCondition',
			'poor': 'https://schema.org/DamagedCondition'
		};
		return conditionMap[condition || 'good'] || 'https://schema.org/UsedCondition';
	}
	
	// Generate breadcrumb structured data
	const breadcrumbJsonLd = $derived(() => {
		if (!product) return null;
		
		const items = [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: 'https://driplo.xyz'
			}
		];

		// Add seller breadcrumb if available
		if (seller?.username) {
			items.push({
				'@type': 'ListItem',
				position: items.length + 1,
				name: seller.username,
				item: `https://driplo.xyz/profile/${seller.username}`
			});
		}

		// Add category breadcrumb if available
		if (product.category_name) {
			const categoryUrl = product.parent_category?.slug && product.category_slug
				? `https://driplo.xyz/category/${product.parent_category.slug}/${product.category_slug}`
				: product.category_slug
					? `https://driplo.xyz/category/${product.category_slug}`
					: `https://driplo.xyz/category/${product.category_name.toLowerCase()}`;
			
			items.push({
				'@type': 'ListItem',
				position: items.length + 1,
				name: product.category_name,
				item: categoryUrl
			});
		}

		// Add current product
		items.push({
			'@type': 'ListItem',
			position: items.length + 1,
			name: product.title,
			item: fullUrl
		});
		
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items
		};
	});
	
	// Generate organization structured data
	const organizationJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Driplo',
		url: 'https://driplo.xyz',
		logo: 'https://driplo.xyz/logo.png',
		sameAs: [
			'https://twitter.com/driplo',
			'https://instagram.com/driplo',
			'https://facebook.com/driplo'
		]
	};
</script>

<svelte:head>
	<!-- Primary Meta Tags -->
	<title>{title} | Driplo</title>
	<meta name="title" content="{title} | Driplo" />
	<meta name="description" content={description} />
	{#if keywords.length > 0}
		<meta name="keywords" content={keywords.join(', ')} />
	{/if}
	
	<!-- Canonical URL -->
	{#if canonical}
		<link rel="canonical" href={canonical} />
	{:else if url}
		<link rel="canonical" href={fullUrl()} />
	{/if}
	
	<!-- Hreflang Links for SEO -->
	<link rel="alternate" hreflang="bg-BG" href={getLocaleUrl('bg', url)} />
	<link rel="alternate" hreflang="en-GB" href={getLocaleUrl('en', url)} />
	<link rel="alternate" hreflang="x-default" href={getLocaleUrl('bg', url)} />
	
	<!-- Robots -->
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={fullUrl()} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullImageUrl} />
	<meta property="og:site_name" content="Driplo" />
	<meta property="og:locale" content={currentLocale === 'bg' ? 'bg_BG' : 'en_GB'} />
	<meta property="og:locale:alternate" content={currentLocale === 'bg' ? 'en_GB' : 'bg_BG'} />
	
	<!-- Product-specific Open Graph -->
	{#if product}
		<meta property="product:price:amount" content={product.price.toString()} />
		<meta property="product:price:currency" content={product.currency || 'EUR'} />
		<meta property="product:availability" content={availability} />
		<meta property="product:condition" content={product.condition || 'used'} />
		{#if product.brand}
			<meta property="product:brand" content={product.brand} />
		{/if}
		{#if product.category_name}
			<meta property="product:category" content={product.category_name} />
		{/if}
	{/if}
	
	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={fullUrl()} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={fullImageUrl} />
	<meta property="twitter:site" content="@driplo" />
	
	<!-- Additional meta tags for e-commerce -->
	{#if product}
		<meta name="product:price" content={productPrice} />
		<meta name="product:availability" content={availability} />
	{/if}
	
	<!-- JSON-LD Structured Data -->
	<!-- JSON-LD Structured Data -->
	{#if jsonLd()}
		<script type="application/ld+json">
			{JSON.stringify(jsonLd())}
		</script>
	{/if}
	
	{#if breadcrumbJsonLd()}
		<script type="application/ld+json">
			{JSON.stringify(breadcrumbJsonLd())}
		</script>
	{/if}
	
	{#if type === 'website'}
		<script type="application/ld+json">
			{JSON.stringify(organizationJsonLd)}
		</script>
	{/if}
	
	<!-- Performance hints -->
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	{#if type === 'product'}
		<!-- Product page specific optimizations -->
		<meta name="format-detection" content="telephone=no" />
		<meta name="theme-color" content="#ffffff" />
	{/if}
	
	<!-- Preconnect to external domains -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	
	<!-- Dynamic preconnect for image domains -->
	{#each preconnectDomains() as domain}
		<link rel="preconnect" href={domain} />
	{/each}
	
	<!-- Preload critical images for LCP optimization -->
	{#each criticalImages() as image}
		<link 
			rel="preload" 
			href={image.url} 
			as={image.as}
			{...(image.media ? { media: image.media } : {})}
			{...(image.fetchpriority ? { fetchpriority: image.fetchpriority } : {})}
		/>
	{/each}
	
	<!-- DNS Prefetch for performance -->
	<link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
	<link rel="dns-prefetch" href="//www.googletagmanager.com" />
	<link rel="dns-prefetch" href="//www.google-analytics.com" />
	
	<!-- Preload critical resources -->
	{#if type === 'product'}
		<!-- Preload product page specific resources -->
		<link rel="prefetch" href="/api/favorites/status" />
		<link rel="prefetch" href="/api/reviews" />
	{/if}
</svelte:head>