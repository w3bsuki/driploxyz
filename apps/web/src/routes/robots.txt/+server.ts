import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const sitemapUrl = `${url.origin}/sitemap.xml`;
	
	const robotsTxt = `# Driplo Robots.txt
User-agent: *
Allow: /

# Directories
Allow: /product/
Allow: /category/
Allow: /profile/
Allow: /search

# Disallow admin/private pages
Disallow: /admin/
Disallow: /dashboard/
Disallow: /settings/
Disallow: /api/
Disallow: /auth/callback

# Sitemap
Sitemap: ${sitemapUrl}

# Crawl delay for respectful crawling
Crawl-delay: 1

# Popular search engine bots
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 0
`;

	return new Response(robotsTxt, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};