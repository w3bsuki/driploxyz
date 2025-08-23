# SEO - SvelteKit Best Practices

**Reference**: https://svelte.dev/docs/kit/seo

## META TAGS

### 1. Basic Meta Tags
```svelte
<!-- +page.svelte -->
<svelte:head>
  <title>Driplo - Buy & Sell Fashion</title>
  <meta name="description" content="Discover unique fashion pieces on Driplo marketplace">
  <meta name="keywords" content="fashion, clothing, marketplace, vintage">
  
  <!-- Canonical URL -->
  <link rel="canonical" href="https://driplo.xyz{$page.url.pathname}">
</svelte:head>
```

### 2. Dynamic Meta Tags
```typescript
// +page.ts
export async function load({ params }) {
  const product = await getProduct(params.id);
  
  return {
    product,
    meta: {
      title: `${product.title} - ${product.price} | Driplo`,
      description: product.description.slice(0, 160),
      image: product.images[0]
    }
  };
}
```

```svelte
<!-- +page.svelte -->
<script>
  let { data } = $props();
</script>

<svelte:head>
  <title>{data.meta.title}</title>
  <meta name="description" content={data.meta.description}>
</svelte:head>
```

## OPEN GRAPH

### 1. Social Media Cards
```svelte
<svelte:head>
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content={title}>
  <meta property="og:description" content={description}>
  <meta property="og:image" content={image}>
  <meta property="og:url" content={url}>
  <meta property="og:site_name" content="Driplo">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content={title}>
  <meta name="twitter:description" content={description}>
  <meta name="twitter:image" content={image}>
  <meta name="twitter:site" content="@driplo">
</svelte:head>
```

### 2. Product Schema
```svelte
<svelte:head>
  {@html `
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "${product.title}",
        "description": "${product.description}",
        "image": "${product.images}",
        "offers": {
          "@type": "Offer",
          "price": "${product.price}",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Person",
            "name": "${product.seller.name}"
          }
        }
      }
    </script>
  `}
</svelte:head>
```

## STRUCTURED DATA

### 1. Organization Schema
```svelte
<!-- app.html or +layout.svelte -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Driplo",
  "url": "https://driplo.xyz",
  "logo": "https://driplo.xyz/logo.png",
  "sameAs": [
    "https://twitter.com/driplo",
    "https://instagram.com/driplo"
  ]
}
</script>
```

### 2. BreadcrumbList
```svelte
<script>
  import { page } from '$app/stores';
  
  $: breadcrumbs = $page.url.pathname.split('/').filter(Boolean);
</script>

<svelte:head>
  {@html `
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": ${JSON.stringify(
          breadcrumbs.map((crumb, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "name": crumb,
            "item": `https://driplo.xyz/${breadcrumbs.slice(0, i + 1).join('/')}`
          }))
        )}
      }
    </script>
  `}
</svelte:head>
```

## SITEMAP GENERATION

### 1. Static Sitemap
```xml
<!-- static/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://driplo.xyz/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://driplo.xyz/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### 2. Dynamic Sitemap
```typescript
// src/routes/sitemap.xml/+server.ts
export async function GET() {
  const products = await getProducts();
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://driplo.xyz</loc>
        <priority>1.0</priority>
      </url>
      ${products.map(p => `
        <url>
          <loc>https://driplo.xyz/product/${p.id}</loc>
          <lastmod>${p.updated_at}</lastmod>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`;
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600'
    }
  });
}
```

## ROBOTS.TXT

```txt
# static/robots.txt
User-agent: *
Allow: /

# Block admin/auth pages
Disallow: /admin
Disallow: /dashboard
Disallow: /login
Disallow: /signup

# Sitemap
Sitemap: https://driplo.xyz/sitemap.xml
```

## PERFORMANCE FOR SEO

### 1. Prerendering
```typescript
// Static pages for instant load
export const prerender = true;
```

### 2. Image SEO
```svelte
<img 
  src={image}
  alt="Descriptive alt text for SEO"
  loading="lazy"
  width="800"
  height="600"
/>
```

### 3. Clean URLs
```typescript
// Use slugs
/product/vintage-leather-jacket

// Not IDs
/product/123456
```

## INTERNATIONALIZATION

```svelte
<svelte:head>
  <!-- Language -->
  <html lang="en">
  
  <!-- Alternate languages -->
  <link rel="alternate" hreflang="es" href="https://driplo.xyz/es">
  <link rel="alternate" hreflang="fr" href="https://driplo.xyz/fr">
</svelte:head>
```

## MONITORING

### 1. Search Console
```html
<!-- app.html -->
<meta name="google-site-verification" content="verification-code">
```

### 2. Analytics
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
```

## CHECKLIST

- [ ] Unique title tags per page
- [ ] Meta descriptions under 160 chars
- [ ] Open Graph tags for social
- [ ] Structured data markup
- [ ] XML sitemap
- [ ] Robots.txt configured
- [ ] Canonical URLs set
- [ ] Alt text on images
- [ ] Clean URL structure
- [ ] Fast page load (< 3s)
- [ ] Mobile-friendly
- [ ] HTTPS enabled