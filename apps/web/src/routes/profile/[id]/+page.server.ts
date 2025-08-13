import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ params, locals: { supabase, session } }) => {
  const services = createServices(supabase);

  // Get the profile with stats
  const { data: profile, error: profileError } = await services.profiles.getProfileWithStats(params.id);

  if (profileError || !profile) {
    throw error(404, 'User not found');
  }

  // Get user's products
  const { data: products } = await services.products.getSellerProducts(params.id, {
    limit: 12,
    sort: { by: 'created_at', direction: 'desc' }
  });

  // Get user's reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      reviewer:profiles!reviews_reviewer_id_fkey (username, avatar_url)
    `)
    .eq('reviewee_id', params.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(10);

  // Check if current user is viewing their own profile
  const isOwnProfile = session?.user?.id === params.id;

  return {
    profile,
    products,
    reviews: reviews || [],
    isOwnProfile,
    currentUser: session?.user || null
  };
};