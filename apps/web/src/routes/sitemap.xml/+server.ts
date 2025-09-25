import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	const supabase = locals.supabase;
	
	// Base URLs for the sitemap
	const baseUrl = 'https://driplo.xyz';
	const staticPages = [
		{ url: '/', priority: 1.0, changefreq: 'daily' },
		{ url: '/search', priority: 0.9, changefreq: 'daily' },
		{ url: '/sell', priority: 0.8, changefreq: 'weekly' },
		{ url: '/about', priority: 0.5, changefreq: 'monthly' },
		{ url: '/help', priority: 0.5, changefreq: 'monthly' },
		{ url: '/terms', priority: 0.3, changefreq: 'yearly' },
		{ url: '/privacy', priority: 0.3, changefreq: 'yearly' },
		{ url: '/login', priority: 0.7, changefreq: 'monthly' },
		{ url: '/signup', priority: 0.7, changefreq: 'monthly' }
	];
	
	// Fetch categories
	const { data: categories } = await supabase
		.from('categories')
		.select('id, name, updated_at')
		.order('name');
	
	// Fetch recent products with seller and category data for canonical URLs
	const { data: products } = await supabase
		.from('products')
		.select(`
			id,
			slug,
			updated_at,
			profiles!products_seller_id_fkey (username),
			categories (slug)
		`)
		.eq('is_sold', false)
		.eq('is_active', true)
		.not('slug', 'is', null)
		.order('updated_at', { ascending: false })
		.limit(1000);
	
	// Fetch active sellers/shops
	const { data: sellers } = await supabase
		.from('profiles')
		.select('username, updated_at')
		.gt('sales_count', 0)
		.order('updated_at', { ascending: false })
		.limit(500);
	
	// Generate XML sitemap
	const xml = generateSitemap({
		baseUrl,
		staticPages,
		categories: (categories || []).filter(c => c.updated_at).map(c => ({
			...c,
			updated_at: c.updated_at!
		})),
		products: (products || [])
			.filter(p => p.updated_at && p.slug && p.profiles?.username)
			.map(p => ({
				id: p.id,
				slug: p.slug!,
				seller_username: p.profiles!.username!,
				category_slug: p.categories?.slug || null,
				updated_at: p.updated_at!
			})),
		sellers: (sellers || [])
			.filter(s => s.updated_at && s.username)
			.map(s => ({
				username: s.username!,
				updated_at: s.updated_at!
			}))
	});
	
	return new Response(xml, {
		headers: {
			'Content-Type': 'application/xml',
			'cache-control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=7200',
			'vary': 'Accept-Encoding',
			'x-cache-strategy': 'dynamic-seo'
		}
	});
};

function generateSitemap({ 
	baseUrl, 
	staticPages, 
	categories, 
	products, 
	sellers 
}: {
	baseUrl: string;
	staticPages: Array<{ url: string; priority: number; changefreq: string }>;
	categories: Array<{ id: string; name: string; updated_at: string }>;
	products: Array<{ id: string; slug: string; seller_username: string; category_slug: string | null; updated_at: string }>;
	sellers: Array<{ username: string; updated_at: string }>;
}) {
	const urls: string[] = [];
	
	// Add static pages
	staticPages.forEach(page => {
		urls.push(`
		<url>
			<loc>${baseUrl}${page.url}</loc>
			<lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
			<changefreq>${page.changefreq}</changefreq>
			<priority>${page.priority}</priority>
		</url>`);
	});
	
	// Add category pages
	categories.forEach(category => {
		urls.push(`
		<url>
			<loc>${baseUrl}/category/${category.id}</loc>
			<lastmod>${new Date(category.updated_at).toISOString().split('T')[0]}</lastmod>
			<changefreq>daily</changefreq>
			<priority>0.8</priority>
		</url>`);
	});
	
	// Add product pages with canonical URLs
	products.forEach(product => {
		const productUrl = product.category_slug 
			? `/products/${product.seller_username}/${product.category_slug}/${product.slug}`
			: `/products/${product.seller_username}/${product.slug}`;
			
		urls.push(`
		<url>
			<loc>${baseUrl}${productUrl}</loc>
			<lastmod>${new Date(product.updated_at).toISOString().split('T')[0]}</lastmod>
			<changefreq>weekly</changefreq>
			<priority>0.8</priority>
		</url>`);
	});
	
	// Add seller profile pages
	sellers.forEach(seller => {
		urls.push(`
		<url>
			<loc>${baseUrl}/profile/${seller.username}</loc>
			<lastmod>${new Date(seller.updated_at).toISOString().split('T')[0]}</lastmod>
			<changefreq>weekly</changefreq>
			<priority>0.6</priority>
		</url>`);
	});
	
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${urls.join('')}
</urlset>`;
}