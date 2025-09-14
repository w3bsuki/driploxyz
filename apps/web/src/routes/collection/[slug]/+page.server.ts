import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { CollectionService } from '$lib/services/collections';
import type { BrandCollection, CollectionWithProducts } from '$lib/services/collections';
import { createLogger } from '$lib/utils/log';

const log = createLogger('collection-page-server');

export const load: PageServerLoad = async ({ params, locals, url }) => {
  const { slug } = params;

  if (!slug) {
    log.error('Collection slug is required');
    throw error(404, 'Collection not found');
  }

  const { safeGetSession } = locals;
  const { user } = await safeGetSession();

  // Get query parameters for pagination
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  const offset = (page - 1) * limit;

  try {
    // Initialize collection service
    const collectionService = new CollectionService(locals.supabase);

    // Get collection with products
    const { data: collection, error: collectionError } = await collectionService.getBrandCollectionWithProducts(
      slug,
      limit,
      offset
    );

    if (collectionError || !collection) {
      log.error('Collection not found:', { slug, error: collectionError });
      throw error(404, 'Collection not found');
    }

    // Get user favorites if logged in
    let userFavorites: Record<string, boolean> = {};
    if (user && collection.products.length > 0) {
      try {
        const productIds = collection.products.map(p => p.id);
        const { data: favorites } = await locals.supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id)
          .in('product_id', productIds);

        if (favorites) {
          userFavorites = favorites.reduce((acc, fav) => {
            acc[fav.product_id] = true;
            return acc;
          }, {} as Record<string, boolean>);
        }
      } catch (favoriteError) {
        log.warn('Failed to fetch user favorites:', favoriteError);
        // Continue without favorites - non-critical
      }
    }

    // Get related collections (same type, excluding current)
    const { data: relatedCollections } = await collectionService.getBrandCollections({
      collection_type: collection.collection_type,
      is_featured: true,
      is_active: true,
      limit: 6
    });

    const filteredRelatedCollections = relatedCollections?.filter(c => c.slug !== slug) || [];

    // Calculate pagination info
    const hasMore = collection.products.length === limit;
    const totalPages = hasMore ? page + 1 : page; // We don't have exact count, estimate

    log.info('Collection loaded successfully:', {
      slug,
      collectionId: collection.id,
      productCount: collection.products.length,
      page,
      hasMore
    });

    return {
      collection: collection as CollectionWithProducts,
      userFavorites,
      relatedCollections: filteredRelatedCollections.slice(0, 5),
      pagination: {
        currentPage: page,
        limit,
        hasMore,
        totalPages,
        hasPrevious: page > 1
      },
      user,
      meta: {
        title: `${collection.name} Collection - Driplo`,
        description: collection.description || `Discover ${collection.name} collection on Driplo. ${collection.collection_type === 'designer' ? 'Luxury designer pieces' : 'Curated streetwear'} from top sellers.`,
        image: collection.products[0]?.images[0] || null,
        canonical: `/collection/${collection.slug}`
      }
    };
  } catch (err) {
    log.error('Error loading collection:', err);
    throw error(500, 'Failed to load collection');
  }
};