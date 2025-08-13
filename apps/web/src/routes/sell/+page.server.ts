import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createServices } from '$lib/services';

export const load: PageServerLoad = async ({ locals: { supabase, session } }) => {
  // Redirect to login if not authenticated
  if (!session) {
    throw redirect(303, '/login?redirect=/sell');
  }

  const services = createServices(supabase);

  try {
    // Get all categories for the form
    const { data: categories, error: categoriesError } = await services.categories.getCategories();

    if (categoriesError) {
      console.error('Error loading categories:', categoriesError);
    }

    return {
      user: session.user,
      categories: categories || []
    };
  } catch (error) {
    console.error('Error loading sell page:', error);
    return {
      user: session.user,
      categories: []
    };
  }
};