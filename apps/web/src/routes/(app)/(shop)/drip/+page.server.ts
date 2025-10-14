import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createLogger } from '$lib/utils/log';
import { CollectionService } from '@repo/core';

const log = createLogger('drip-collections-page');

export const load = (async ({
  locals: { supabase, safeGetSession }
}) => {
  const { session, user } = await safeGetSession();

  log.debug('Loading drip collections');

  try {
    const collectionService = new CollectionService(supabase);

    // Fetch collections via supported API
    const { data: collections, error: collectionsError } = await collectionService.getCollections();

    if (collectionsError) {
      log.error('Error loading drip collections', collectionsError);
      return {
        collections: [],
        user,
        session,
        profile: user ? { username: user.user_metadata?.username || user.email?.split('@')[0] } : null,
        meta: {
          title: 'Drip Collections - Driplo',
          description: 'Discover curated streetwear collections and trending fashion',
          canonical: '/drip'
        }
      };
    }

    // Note: Filtering by type/active would require extended service fields; returning all for now
    return {
      collections: collections || [],
      user,
      session,
      profile: user ? {
        username: user.user_metadata?.username || user.email?.split('@')[0]
      } : null,
      meta: {
        title: 'Drip Collections - Driplo',
        description: 'Discover curated streetwear collections and trending fashion',
        canonical: '/drip'
      }
    };

  } catch (err) {
    log.error('Unexpected error in drip collections page load', err);
    error(500, 'Something went wrong loading the drip collections');
  }
}) satisfies PageServerLoad;