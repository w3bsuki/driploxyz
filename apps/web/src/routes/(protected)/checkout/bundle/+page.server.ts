import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();
  
  if (!session || !user) {
    redirect(303, '/login');
  }

  // Return test bundle data for Playwright tests
  return {
    bundleItems: [
      {
        id: 'test-item-1',
        title: 'Test Item 1',
        price: 19.99,
        image: '/placeholder-product.svg'
      },
      {
        id: 'test-item-2',
        title: 'Test Item 2',
        price: 24.99,
        image: '/placeholder-product.svg'
      }
    ],
    user
  };
}) satisfies PageServerLoad;