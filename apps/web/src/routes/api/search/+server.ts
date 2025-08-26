import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const query = url.searchParams.get('q') || '';
  const limit = parseInt(url.searchParams.get('limit') || '5');
  const includeCategories = url.searchParams.get('include_categories') === 'true';
  
  if (!query.trim()) {
    return json({ products: [], categories: [] });
  }

  try {
    // Search products
    const { data: products, error: productsError } = await locals.supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        product_images (
          image_url
        )
      `)
      .eq('is_sold', false)
      .eq('is_active', true)
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (productsError) throw productsError;

    const transformedProducts = (products || []).map(p => ({
      id: p.id,
      title: p.title,
      price: p.price,
      image: p.product_images?.[0]?.image_url || null
    }));

    // Search categories if requested
    let categories: any[] = [];
    if (includeCategories) {
      const { data: categoryData, error: categoryError } = await locals.supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          level,
          parent_id
        `)
        .ilike('name', `%${query}%`)
        .limit(5);

      if (!categoryError && categoryData) {
        // Get parent categories to build paths
        const parentIds = categoryData
          .filter(c => c.parent_id)
          .map(c => c.parent_id);
        
        const { data: parents } = await locals.supabase
          .from('categories')
          .select('id, name, parent_id')
          .in('id', parentIds.filter(id => id !== null) as string[]);

        const parentMap = new Map();
        parents?.forEach(p => parentMap.set(p.id, p));

        // Build category paths
        categories = categoryData.map(cat => {
          let path = cat.name;
          let icon = getCategoryIcon(cat.name, cat.level || 1);
          
          if (cat.parent_id) {
            const parent = parentMap.get(cat.parent_id);
            if (parent) {
              path = `${parent.name} > ${cat.name}`;
              // If parent has parent (level 3 category)
              if (parent.parent_id) {
                const grandparent = parentMap.get(parent.parent_id);
                if (grandparent) {
                  path = `${grandparent.name} > ${parent.name} > ${cat.name}`;
                }
              }
            }
          }

          return {
            id: cat.slug || cat.id,
            name: cat.name,
            level: cat.level || 1,
            path: path,
            icon: icon
          };
        });
      }
    }

    return json({ 
      products: transformedProducts,
      categories: categories
    });
  } catch (error) {
    console.error('Search API error:', error);
    return json({ products: [], categories: [], error: 'Search failed' }, { status: 500 });
  }
};

function getCategoryIcon(name: string, level: number): string {
  // Level 1 icons
  if (level === 1) {
    const icons: Record<string, string> = {
      'Women': '👗',
      'Men': '👔',
      'Kids': '👶',
      'Unisex': '👥'
    };
    return icons[name] || '📦';
  }
  
  // Level 2 icons
  if (level === 2) {
    const icons: Record<string, string> = {
      'Clothing': '👕',
      'Shoes': '👟',
      'Bags': '👜',
      'Accessories': '💍'
    };
    return icons[name] || '🏷️';
  }
  
  // Level 3 - specific items
  const icons: Record<string, string> = {
    'T-Shirts': '👕',
    'Shirts': '👔',
    'Jeans': '👖',
    'Dresses': '👗',
    'Jackets': '🧥',
    'Sneakers': '👟',
    'Boots': '🥾',
    'Heels': '👠',
    'Backpacks': '🎒',
    'Watches': '⌚',
    'Sunglasses': '🕶️'
  };
  
  // Check for partial matches
  for (const [key, icon] of Object.entries(icons)) {
    if (name.includes(key)) {
      return icon;
    }
  }
  
  return '🏷️';
}