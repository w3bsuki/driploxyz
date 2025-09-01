/**
 * URL canonicalization utilities for filter parameters
 * Handles legacy parameter names and redirects
 */

export interface FilterUrlResult {
  canonical: URLSearchParams;
  needsRedirect: boolean;
}

/**
 * Translate legacy filter parameters to canonical ones
 * Legacy: level1/level2/level3 → Canonical: category/subcategory/specific
 */
export function canonicalizeFilterUrl(url: URL): FilterUrlResult {
  const params = new URLSearchParams(url.searchParams);
  let needsRedirect = false;
  
  // Map legacy parameters to canonical
  const legacyMappings = {
    level1: 'category',
    level2: 'subcategory', 
    level3: 'specific'
  };
  
  // Check for legacy parameters and map them
  // Canonical parameters take precedence over legacy ones
  Object.entries(legacyMappings).forEach(([legacy, canonical]) => {
    const legacyValue = params.get(legacy);
    const canonicalValue = params.get(canonical);
    
    if (legacyValue) {
      // Only use legacy value if canonical doesn't exist
      if (!canonicalValue) {
        params.set(canonical, legacyValue);
      }
      params.delete(legacy);
      needsRedirect = true;
    }
  });
  
  return {
    canonical: params,
    needsRedirect
  };
}

/**
 * Build canonical URL from current URL and parameters
 */
export function buildCanonicalUrl(url: URL, canonicalParams: URLSearchParams): string {
  const newUrl = new URL(url);
  newUrl.search = canonicalParams.toString();
  return newUrl.toString();
}

export interface CombinedSlugResult {
  segments: string[];
  searchParams: URLSearchParams;
  needsRedirect: boolean;
  canonicalPath?: string;
}

/**
 * Parse combined category slugs and convert to hierarchical segments
 * Examples:
 * - "women" → ["women"]
 * - "women-clothing" → ["women", "clothing"]  
 * - "women-clothing-dresses" → ["women", "clothing", "dresses"]
 */
export function parseCombinedCategorySlug(slug: string): CombinedSlugResult {
  if (!slug || slug.trim() === '') {
    return {
      segments: [],
      searchParams: new URLSearchParams(),
      needsRedirect: false
    };
  }

  const cleanSlug = slug.trim().toLowerCase();
  
  // Check if it's a known Level 1 category (no redirect needed)
  const level1Categories = ['women', 'men', 'kids', 'unisex'];
  if (level1Categories.includes(cleanSlug)) {
    return {
      segments: [cleanSlug],
      searchParams: new URLSearchParams(),
      needsRedirect: false
    };
  }

  // Split by hyphen and try to parse hierarchically
  const parts = cleanSlug.split('-');
  
  if (parts.length < 2) {
    // Single part but not a known L1 category
    return {
      segments: parts,
      searchParams: new URLSearchParams(),
      needsRedirect: false
    };
  }

  // Try to identify L1, L2, L3 pattern
  const [potentialL1, ...remainingParts] = parts;
  
  if (!potentialL1 || !level1Categories.includes(potentialL1)) {
    // Not a valid L1 category, treat as search
    const searchParams = new URLSearchParams();
    searchParams.set('q', cleanSlug.replace(/-/g, ' '));
    
    return {
      segments: [],
      searchParams,
      needsRedirect: true,
      canonicalPath: '/search'
    };
  }

  // Valid L1 found, build segments
  const segments: string[] = [potentialL1];
  
  if (remainingParts.length > 0) {
    // Known L2 categories
    const level2Categories = ['clothing', 'shoes', 'accessories', 'bags'];
    const potentialL2 = remainingParts[0];
    
    if (potentialL2 && level2Categories.includes(potentialL2)) {
      segments.push(potentialL2);
      
      // Check for L3
      if (remainingParts.length > 1) {
        // Join remaining parts as L3 (could be multi-word)
        const l3Slug = remainingParts.slice(1).join('-');
        segments.push(l3Slug);
      }
    } else {
      // Not a known L2, treat as specific category under L1
      const specificSlug = remainingParts.join('-');
      segments.push(specificSlug);
    }
  }

  // Build canonical path and determine if redirect is needed
  const canonicalPath = `/category/${segments.join('/')}`;
  const currentPath = `/category/${cleanSlug}`;
  
  return {
    segments,
    searchParams: new URLSearchParams(),
    needsRedirect: canonicalPath !== currentPath,
    canonicalPath
  };
}

/**
 * Convert search parameters to category segments for backward compatibility
 * Legacy: /search?category=women&subcategory=clothing&specific=dresses
 * New: /category/women/clothing/dresses
 */
export function searchParamsToSegments(searchParams: URLSearchParams): CombinedSlugResult {
  const segments: string[] = [];
  
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');
  const specific = searchParams.get('specific');
  
  if (category && category !== 'all') {
    segments.push(category);
  }
  
  if (subcategory && subcategory !== 'all') {
    segments.push(subcategory);
  }
  
  if (specific && specific !== 'all') {
    segments.push(specific);
  }
  
  if (segments.length === 0) {
    return {
      segments: [],
      searchParams,
      needsRedirect: false
    };
  }
  
  // Create new search params without category hierarchy
  const newSearchParams = new URLSearchParams(searchParams);
  newSearchParams.delete('category');
  newSearchParams.delete('subcategory'); 
  newSearchParams.delete('specific');
  
  return {
    segments,
    searchParams: newSearchParams,
    needsRedirect: true,
    canonicalPath: `/category/${segments.join('/')}`
  };
}