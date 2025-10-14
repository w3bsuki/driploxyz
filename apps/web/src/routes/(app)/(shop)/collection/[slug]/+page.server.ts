import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { CollectionService } from '@repo/core';
import { createLogger } from '$lib/utils/log';

const log = createLogger('collection-page-server');

export const load = (async ({ params, locals, url }) => {
  const { slug } = params;

  if (!slug) {
    log.error('Collection slug is required');
    error(404, 'Collection not found');
  }

  const { safeGetSession } = locals;
  const { user } = await safeGetSession();

  // Get query parameters for pagination
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);
  // const offset = (page - 1) * limit;

  try {
    // Initialize collection service
    const collectionService = new CollectionService(locals.supabase);

  // Get collection metadata
  const { data: collection, error: collectionError } = await collectionService.getCollectionBySlug(slug);

    if (collectionError || !collection) {
      log.error('Collection not found:', { slug, error: collectionError });
      error(404, 'Collection not found');
    }

    // Get user favorites if logged in (no products list available in core type)
    const userFavorites: Record<string, boolean> = {};

    // Get related collections (same type, excluding current)
    const { data: relatedCollections } = await collectionService.getCollections();

    const filteredRelatedCollections = relatedCollections?.filter(c => c.slug !== slug) || [];

    // Calculate pagination info
  const hasMore = collection.product_count > page * limit;
    const totalPages = hasMore ? page + 1 : page; // We don't have exact count, estimate

    log.info('Collection loaded successfully:', {
      slug,
      collectionId: collection.id,
  productCount: collection.product_count,
      page,
      hasMore: hasMore ? 'true' : 'false'
    });

    return {
  collection,
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
        description: collection.description || `Discover ${collection.name} collection on Driplo. Curated items from top sellers.`,
        image: null,
        canonical: `/collection/${collection.slug}`
      }
    };
  } catch (err) {
    log.error('Error loading collection:', err);
    error(500, 'Failed to load collection');
  }
}) satisfies PageServerLoad;