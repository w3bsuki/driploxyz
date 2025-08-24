# Multi-Domain Setup for Country Markets

## Quick Setup Guide

### 1. Add Domain to Vercel
```bash
# In your project directory
vercel domains add driplo.co.uk

# Or do it in Vercel Dashboard:
# Settings → Domains → Add Domain
```

### 2. Update Country Detection

Edit `/apps/web/src/lib/country/detection.ts`:

```typescript
// Get country from domain
export function getCountryFromDomain(hostname: string): CountryCode | null {
  if (hostname.includes('.uk') || hostname.includes('uk.')) return 'GB';
  if (hostname.includes('.bg') || hostname.includes('bg.')) return 'BG';
  if (hostname.includes('.us') || hostname.includes('us.')) return 'US';
  return null;
}
```

### 3. Update Server Hooks

Edit `/apps/web/src/lib/server/country.ts`:

```typescript
import { getCountryFromDomain, getUserCountry } from '$lib/country/detection';

export async function setupCountry(event: RequestEvent): Promise<void> {
  // 1. First check domain
  const domainCountry = getCountryFromDomain(event.url.hostname);
  
  if (domainCountry) {
    event.locals.country = domainCountry;
    return;
  }
  
  // 2. Fall back to IP/cookie detection
  const country = await getUserCountry(event);
  event.locals.country = country;
}
```

## Domain Options Comparison

| Option | Cost | Setup | Pros | Cons |
|--------|------|-------|------|------|
| **Single Domain** `driplo.xyz` | $0 | None | Simple, no extra cost | Less local trust |
| **Country TLDs** `driplo.co.uk` | ~$10/year | Add to Vercel | Local trust, SEO boost | Domain cost |
| **Subdomains** `uk.driplo.xyz` | $0 | DNS only | Free, clear separation | Less professional |

## Recommended Approach

### Phase 1: Launch with Subdomains (NOW)
- `uk.driplo.xyz` for UK
- `driplo.xyz` for Bulgaria
- Test the market with zero extra cost

### Phase 2: Buy Local Domain (IF SUCCESSFUL)
- Get `driplo.co.uk` when UK sales justify it
- Keep same backend, just add domain

## DNS Settings for Subdomains

Add these records to your DNS:
```
uk.driplo.xyz    CNAME    cname.vercel-dns.com
bg.driplo.xyz    CNAME    cname.vercel-dns.com
```

## Testing Locally

```bash
# Add to your hosts file for testing:
# Windows: C:\Windows\System32\drivers\etc\hosts
# Mac/Linux: /etc/hosts

127.0.0.1    uk.driplo.local
127.0.0.1    bg.driplo.local

# Then access:
http://uk.driplo.local:5173  # Shows UK products
http://bg.driplo.local:5173  # Shows BG products
```

## SEO Considerations

Add hreflang tags for better SEO:

```svelte
<svelte:head>
  <link rel="alternate" hreflang="en-GB" href="https://uk.driplo.xyz{$page.url.pathname}" />
  <link rel="alternate" hreflang="bg-BG" href="https://driplo.xyz{$page.url.pathname}" />
  <link rel="alternate" hreflang="x-default" href="https://driplo.xyz{$page.url.pathname}" />
</svelte:head>
```

## The Magic: One Project, Multiple Markets

All these domains/subdomains point to the SAME:
- Same Vercel deployment
- Same Supabase database
- Same codebase
- Just filtered by country!

No need for separate projects, separate databases, or separate deployments!