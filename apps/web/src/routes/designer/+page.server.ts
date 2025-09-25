import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLogger } from '$lib/utils/log';
import { CollectionService } from '$lib/services/collections';

const log = createLogger('designer-collections-page');

export const load = (async ({
  locals: { supabase, safeGetSession }
}) => {
  const { session, user } = await safeGetSession();

  log.debug('Loading designer collections');

  try {
    const collectionService = new CollectionService(supabase);

    // Get all designer collections (active ones)
    const { data: collections, error: collectionsError } = await collectionService.getBrandCollections({
      collection_type: 'designer',
      is_active: true,
      is_featured: undefined // Get all active designer collections, not just featured
    });

    if (collectionsError) {
      log.error('Error loading designer collections', collectionsError);
      return {
        collections: [],
        user,
        session,
        profile: user ? { username: user.user_metadata?.username || user.email?.split('@')[0] } : null,
        meta: {
          title: 'Designer Collections - Driplo',
          description: 'Discover curated designer collections and luxury fashion',
          canonical: '/designer'
        }
      };
    }

    return {
      collections: collections || [],
      user,
      session,
      profile: user ? {
        username: user.user_metadata?.username || user.email?.split('@')[0]
      } : null,
      meta: {
        title: 'Designer Collections - Driplo',
        description: 'Discover curated designer collections and luxury fashion',
        canonical: '/designer'
      }
    };

  } catch (err) {
    log.error('Unexpected error in designer collections page load', err);
    error(500, 'Something went wrong loading the designer collections');
  }
}) satisfies PageServerLoad;