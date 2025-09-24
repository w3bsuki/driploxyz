import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { parseCombinedCategorySlug, searchParamsToSegments } from '$lib/utils/filter-url';

export const load = (async ({ params, url }) => {
  const slug = (params as any).slug as string;

  try {
    // Check if this is a legacy search parameter pattern in URL
    const searchParams = url.searchParams;
    const hasLegacyParams = searchParams.has('category') || searchParams.has('subcategory') || searchParams.has('specific');
    
    if (hasLegacyParams) {
      // Convert search parameters to segments and redirect
      const result = searchParamsToSegments(searchParams);
      if (result.needsRedirect && result.canonicalPath) {
        const newUrl = result.canonicalPath + (result.searchParams.toString() ? `?${result.searchParams.toString()}` : '');
        throw redirect(301, newUrl);
      }
    }

    // Parse combined slug into hierarchical segments
    const result = parseCombinedCategorySlug(slug);
    
    if (result.needsRedirect && result.canonicalPath) {
      // Preserve any additional query parameters
      const additionalParams = new URLSearchParams(url.searchParams);
      const newUrl = result.canonicalPath + (additionalParams.toString() ? `?${additionalParams.toString()}` : '');
      throw redirect(301, newUrl);
    }

    // Always redirect to the hierarchical route, but handle L1 categories specially
    // to avoid infinite loops
    if (result.segments.length > 0) {
      // For L1 categories like 'men', we need to make the URL structure clear
      // The issue is that /category/men maps to both routes
      // Solution: L1 categories in the old route should redirect with no additional path
      const hierarchicalPath = `/category/${result.segments.join('/')}`;
      const additionalParams = new URLSearchParams(url.searchParams);
      const newUrl = hierarchicalPath + (additionalParams.toString() ? `?${additionalParams.toString()}` : '');
      
      // This will cause /category/men (slug route) to redirect to /category/men (segments route)
      // The segments route can handle this properly
      throw redirect(301, newUrl);
    }

    // If no valid segments found, this might be an invalid category
    throw error(404, `Category '${slug}' not found`);
  } catch (err) {
    
    
    // Re-throw redirect and error responses
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to process category request');
  }
}) satisfies PageServerLoad;