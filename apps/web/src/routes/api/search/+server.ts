import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url, locals, setHeaders }) => {
  const country = locals.country || 'BG';

  // Cache briefly at the edge for anonymous traffic
  setHeaders({ 'cache-control': 'public, max-age=30, s-maxage=120' });

  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const pageSize = parseInt(url.searchParams.get('pageSize') || '50', 10);
  
  // Handle both canonical and legacy parameter names
  const category = url.searchParams.get('category') || url.searchParams.get('level1') || '';
  const subcategory = url.searchParams.get('subcategory') || url.searchParams.get('level2') || '';
  const specific = url.searchParams.get('specific') || url.searchParams.get('level3') || '';
  const minPrice = url.searchParams.get('min_price');
  const maxPrice = url.searchParams.get('max_price');
  const condition = url.searchParams.get('condition');
  const brand = url.searchParams.get('brand');
  const size = url.searchParams.get('size');
  const sortBy = url.searchParams.get('sort') || 'relevance';

  try {
    // Resolve category IDs similarly to +page.server.ts but simplified
    // Get all categories once (used to compute hierarchy levels quickly)
    const { data: allCategories } = await locals.supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);

    let categoryIds: string[] = [];

    const findByName = (name: string) => allCategories?.find((c) => c.name?.toLowerCase() === name.toLowerCase());
    const findBySlug = (slug: string) => allCategories?.find((c) => c.slug?.toLowerCase() === slug.toLowerCase());
    const childrenOf = (id: string) => allCategories?.filter((c) => c.parent_id === id) || [];

    if (category && category !== 'all') {
      // Try finding by slug first (more reliable), fallback to name
      const l1 = findBySlug(category) || findByName(category);
      if (l1) {
        if (subcategory && subcategory !== 'all') {
          const l2 = childrenOf(l1.id).find((c) => c.slug?.toLowerCase() === subcategory.toLowerCase() || c.name?.toLowerCase() === subcategory.toLowerCase());
          if (l2) {
            if (specific && specific !== 'all') {
              const l3 = childrenOf(l2.id).find((c) => c.slug?.toLowerCase() === specific.toLowerCase() || c.name?.toLowerCase() === specific.toLowerCase());
              categoryIds = l3 ? [l3.id] : childrenOf(l2.id).map((c) => c.id);
            } else {
              categoryIds = [l2.id, ...childrenOf(l2.id).map((c) => c.id)];
            }
          } else {
            categoryIds = [l1.id, ...childrenOf(l1.id).flatMap(child => [child.id, ...childrenOf(child.id).map(c => c.id)])];
          }
        } else {
          categoryIds = [l1.id, ...childrenOf(l1.id).flatMap(child => [child.id, ...childrenOf(child.id).map(c => c.id)])];
        }
      }
    } else if (subcategory && subcategory !== 'all') {
      const l2s = allCategories?.filter((c) => c.level === 2 && (c.slug?.toLowerCase() === subcategory.toLowerCase() || c.name?.toLowerCase() === subcategory.toLowerCase())) || [];
      const all = l2s.flatMap((l2) => [l2.id, ...childrenOf(l2.id).map((c) => c.id)]);
      categoryIds = Array.from(new Set(all));
    } else if (specific && specific !== 'all') {
      const l3s = allCategories?.filter((c) => c.level === 3 && (c.slug?.toLowerCase() === specific.toLowerCase() || c.name?.toLowerCase() === specific.toLowerCase())) || [];
      categoryIds = l3s.map((c) => c.id);
    }

    // Build products query
    let productsQuery = locals.supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        brand,
        size,
        condition,
        location,
        created_at,
        seller_id,
        category_id,
        country_code,
        product_images ( image_url ),
        profiles!products_seller_id_fkey ( username, avatar_url, account_type ),
        categories!inner ( id, name, slug, parent_id, level )
      `)
      .eq('is_sold', false)
      .eq('is_active', true)
      .eq('country_code', country);

    if (categoryIds.length > 0) productsQuery = productsQuery.in('category_id', categoryIds);
    if (query && query.trim()) productsQuery = productsQuery.ilike('title', `%${query}%`);
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) productsQuery = productsQuery.gte('price', min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) productsQuery = productsQuery.lte('price', max);
    }
    if (condition && condition !== 'all') {
      const validConditions = ['brand_new_with_tags', 'new_without_tags', 'like_new', 'good', 'worn', 'fair'] as const;
      if (validConditions.includes(condition as typeof validConditions[number])) {
        productsQuery = productsQuery.eq('condition', condition as typeof validConditions[number]);
      }
    }
    if (brand && brand !== 'all') productsQuery = productsQuery.ilike('brand', `%${brand}%`);
    if (size && size !== 'all') productsQuery = productsQuery.eq('size', size);

    switch (sortBy) {
      case 'price-low':
        productsQuery = productsQuery.order('price', { ascending: true });
        break;
      case 'price-high':
        productsQuery = productsQuery.order('price', { ascending: false });
        break;
      case 'newest':
      default:
        productsQuery = productsQuery.order('created_at', { ascending: false });
        break;
    }

    const offset = (page - 1) * pageSize;
    productsQuery = productsQuery.range(offset, offset + pageSize - 1);
    const { data: products } = await productsQuery;

    const transformed = (products || []).map((product: any) => {
      let mainCategoryName = '';
      let subcategoryName = '';
      let specificCategoryName = '';
      const cats = allCategories || [];
      if (product.categories) {
        if (product.categories.level === 1) {
          mainCategoryName = product.categories.name;
        } else if (product.categories.level === 2) {
          subcategoryName = product.categories.name;
          const parentCat = cats.find((cat) => cat.id === product.categories.parent_id);
          if (parentCat) mainCategoryName = parentCat.name;
        } else if (product.categories.level === 3) {
          specificCategoryName = product.categories.name;
          const parentCat = cats.find((cat: any) => cat.id === product.categories.parent_id);
          if (parentCat) {
            subcategoryName = parentCat.name;
            const grandparentCat = cats.find((cat) => cat.id === parentCat.parent_id);
            if (grandparentCat) mainCategoryName = grandparentCat.name;
          }
        }
      }
      return {
        ...product,
        images: product.product_images?.map((img: { image_url: string }) => img.image_url) || [],
        seller: product.profiles ? {
          id: product.seller_id,
          username: product.profiles.username,
          avatar_url: product.profiles.avatar_url,
          account_type: product.profiles.account_type
        } : null,
        category: product.categories || null,
        main_category_name: mainCategoryName || null,
        category_name: mainCategoryName || null,
        subcategory_name: subcategoryName || null,
        specific_category_name: specificCategoryName || null
      };
    });

    return json({
      products: transformed,
      hasMore: transformed.length === pageSize,
      currentPage: page
    });
  } catch (e) {
    return json({ products: [], hasMore: false, currentPage: page }, { status: 200 });
  }
};

