import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.session?.user?.id) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await locals.supabase
      .from('favorites')
      .insert({
        user_id: locals.session.user.id,
        product_id: productId
      });

    if (error) {
      
      return json({ error: 'Failed to add favorite' }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
  if (!locals.session?.user?.id) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { productId } = await request.json();

    if (!productId) {
      return json({ error: 'Product ID is required' }, { status: 400 });
    }

    const { error } = await locals.supabase
      .from('favorites')
      .delete()
      .eq('user_id', locals.session.user.id)
      .eq('product_id', productId);

    if (error) {
      
      return json({ error: 'Failed to remove favorite' }, { status: 500 });
    }

    return json({ success: true });
  } catch (error) {
    
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};