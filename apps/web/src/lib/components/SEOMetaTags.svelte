<script lang="ts">
	import type { Product, Profile } from '@repo/ui/types';
	
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
		canonical
	}: Props = $props();
	
	// Generate full URL
	const fullUrl = $derived(url ? `https://driplo.xyz${url}` : 'https://driplo.xyz');
	const fullImageUrl = $derived(
		image && typeof image === 'string' && image.startsWith('http') 
			? image 
			: `https://driplo.xyz${image || '/default-og-image.jpg'}`
	);
	
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
		
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'Home',
					item: 'https://driplo.xyz'
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: product.category_name || 'Products',
					item: `https://driplo.xyz/category/${product.category_id}`
				},
				{
					'@type': 'ListItem',
					position: 3,
					name: product.title,
					item: fullUrl
				}
			]
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
		<link rel="canonical" href={fullUrl} />
	{/if}
	
	<!-- Robots -->
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}
	
	<!-- Open Graph / Facebook -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={fullUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={fullImageUrl} />
	<meta property="og:site_name" content="Driplo" />
	<meta property="og:locale" content="en_US" />
	
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
	<meta property="twitter:url" content={fullUrl} />
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
	{#if jsonLd()}
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd())}</script>`}
	{/if}
	
	{#if breadcrumbJsonLd()}
		{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbJsonLd())}</script>`}
	{/if}
	
	{#if type === 'website'}
		{@html `<script type="application/ld+json">${JSON.stringify(organizationJsonLd)}</script>`}
	{/if}
	
	<!-- Preconnect to external domains -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	{#if product?.images?.[0] && typeof product.images[0] === 'string' && product.images[0].includes('supabase')}
		<link rel="preconnect" href="https://your-supabase-url.supabase.co" />
	{/if}
	
	<!-- DNS Prefetch for performance -->
	<link rel="dns-prefetch" href="//cdn.jsdelivr.net" />
	<link rel="dns-prefetch" href="//www.googletagmanager.com" />
</svelte:head>