/**
 * Client-side functions for product operations
 */

export async function getPriceSuggestions(params: {
  categoryId: string;
  brand?: string;
  condition: 'brand_new_with_tags' | 'new_without_tags' | 'like_new' | 'good' | 'worn' | 'fair';
  size?: string;
}) {
  try {
    const response = await fetch('/api/products/price-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      throw new Error('Failed to get price suggestions');
    }

    return await response.json();
  } catch {
    // Price suggestions failed - return default fallback
    return {
      suggested: null,
      range: null,
      confidence: 'low'
    };
  }
}