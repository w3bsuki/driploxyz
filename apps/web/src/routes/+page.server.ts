import type { PageServerLoad } from './$types';
import type { Tables } from '@repo/database';
import { redirect } from '@sveltejs/kit';

type Product = Tables<'products'>;
type Category = Tables<'categories'>;
import { dev } from '$app/environment';
// import { withTimeout } from '@repo/core/utils';

export const load = (async ({ url, locals, depends }) => {
  const { supabase, country, safeGetSession } = locals;

  depends('home:data');

  // Check if this is an auth callback that went to the wrong URL
  const code = url.searchParams.get('code');
  if (code) {
    const params = new URLSearchParams(url.searchParams);
    if (!params.has('next')) {
      params.set('next', '/onboarding');
    }
    redirect(303, `/auth/callback?${params.toString()}`);
  }

  // Handle missing Supabase configuration - return empty data for now
  if (!supabase) {
    return {
      featuredProducts: [],
      categories: [],
      topSellers: [],
      topBrands: [],
      country: country || 'BG',
      user: null,
      profile: null,
      errors: {
        products: 'Database not configured',
        categories: 'Database not configured',
        sellers: 'Database not configured',
        brands: 'Database not configured'
      }
    };
  }

  // Get current user session
  const { session: _session, user } = await safeGetSession();

  try {
    // Fetch data in parallel
    const [productsResult, categoriesResult, topSellersResult] = await Promise.all([
      // Fetch featured products (active products, ordered by creation date)
      supabase
        .from('products')
        .select(`*, product_images ( image_url, sort_order )`)
        .eq('is_active', true)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12),

      // Fetch categories
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true }),

      // Fetch top sellers (profiles with sales)
      supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, rating, sales_count')
        .gt('sales_count', 0)
        .order('sales_count', { ascending: false })
        .limit(6)
    ]);

    const { data: products, error: productsError } = productsResult;
    const { data: categories, error: categoriesError } = categoriesResult;
    const { data: topSellers, error: sellersError } = topSellersResult;

    const categoryLookup = new Map<string, Category>();
    (categories ?? []).forEach((category) => {
      if (!category?.id) return;
      categoryLookup.set(String(category.id), category);
    });

    const resolveCategoryHierarchy = (categoryId: string | null | undefined) => {
      let main: string | null = null;
      let sub: string | null = null;
      let specific: string | null = null;

      if (!categoryId) {
        return { main, sub, specific };
      }

      const current = categoryLookup.get(String(categoryId));
      if (!current) {
        return { main, sub, specific };
      }

      if (current.level === 1) {
        main = current.name ?? null;
      } else if (current.level === 2) {
        sub = current.name ?? null;
        const parent = current.parent_id ? categoryLookup.get(String(current.parent_id)) : undefined;
        if (parent) {
          main = parent.name ?? null;
        }
      } else if (current.level === 3) {
        specific = current.name ?? null;
        const parent = current.parent_id ? categoryLookup.get(String(current.parent_id)) : undefined;
        if (parent) {
          sub = parent.name ?? null;
          const grandparent = parent.parent_id ? categoryLookup.get(String(parent.parent_id)) : undefined;
          if (grandparent) {
            main = grandparent.name ?? null;
          }
        }
      }

      return { main, sub, specific };
    };

    // Transform products to include images array and required UI fields
    const featuredProducts: Product[] = (products || []).map((product: any) => {
      const images = (product.product_images || [])
        .slice()
        .sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((img: any) => img.image_url)
        .filter((u: unknown): u is string => typeof u === 'string' && !!u);

      const { main, sub, specific } = resolveCategoryHierarchy(product.category_id ?? product.categoryId ?? null);

      const uiProduct: Product = {
        ...product,
        images,
        // UI required fields with safe defaults
        sellerName: product.seller_name ?? '',
        sellerRating: Number(product.seller_rating ?? 0),
        sellerId: product.seller_id,
        createdAt: product.created_at ?? new Date().toISOString(),
        product_images: product.product_images || [],
        main_category_name: product.main_category_name ?? main ?? undefined,
        category_name: product.category_name ?? main ?? undefined,
        subcategory_name: product.subcategory_name ?? sub ?? undefined,
        specific_category_name: product.specific_category_name ?? specific ?? undefined
      };
      return uiProduct;
    });

    return {
  featuredProducts,
      categories: categories || [],
      topSellers: topSellers || [],
      topBrands: [],
      country: country || 'BG',
  user: user || null,
      profile: null,
      errors: {
        products: productsError?.message || null,
        categories: categoriesError?.message || null,
        sellers: sellersError?.message || null,
        brands: null
      }
    };

  } catch (error) {
    if (dev) {
      console.error('Error loading homepage data:', error);
    }
    return {
      featuredProducts: [],
      categories: [],
      topSellers: [],
      topBrands: [],
      country: country || 'BG',
  user: user || null,
      profile: null,
      errors: {
        products: 'Failed to load products',
        categories: 'Failed to load categories',
        sellers: 'Failed to load sellers',
        brands: 'Failed to load brands'
      }
    };
  }
}) satisfies PageServerLoad;