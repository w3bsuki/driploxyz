import { json } from '@sveltejs/kit';
import { z } from 'zod';
import { getPriceSuggestions } from '$lib/server/products';
import { ProductCondition } from '$lib/validation/product';
import type { RequestHandler } from './$types';

const PriceSuggestionSchema = z.object({
  categoryId: z.string().uuid(),
  brand: z.string().optional(),
  condition: ProductCondition,
  size: z.string().optional()
});

export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const params = PriceSuggestionSchema.parse(body);
    
    const suggestions = await getPriceSuggestions(locals.supabase, params);
    
    return json(suggestions);
  } catch {
    
    return json(
      { error: 'Failed to get price suggestions' },
      { status: 500 }
    );
  }
};