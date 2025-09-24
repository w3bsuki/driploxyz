import type { PageServerLoad } from './$types';


export const load = (async ({ locals: { supabase, session } }) => {
  if (!session?.user) {
    return {
      favoritedProducts: [],
      error: null
    };
  }

  try {
    // Get user's favorited products
    const { data: favorites, error: favoritesError } = await supabase
      .from('favorites')
      .select(`
        product_id,
        created_at,
        products!product_id (
          *,
          favorite_count,
          product_images!product_id (
            id,
            image_url,
            alt_text,
            sort_order
          ),
          categories!category_id (name),
          profiles!seller_id (username, rating, avatar_url)
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (favoritesError) {
      
      return {
        favoritedProducts: [],
        error: 'Failed to load favorites'
      };
    }

    // Transform the data to match the Product interface
    const favoritedProducts = (favorites || [])
      .filter(favorite => favorite.products) // Filter out any null products
      .map(favorite => ({
        ...favorite.products,
        images: (favorite.products.product_images || []).map((img: { image_url: string }) => img.image_url),
        product_images: favorite.products.product_images || [],
        category_name: favorite.products.categories?.name,
        seller_name: favorite.products.profiles?.username,
        seller_username: favorite.products.profiles?.username,
        seller_rating: favorite.products.profiles?.rating,
        seller_avatar: favorite.products.profiles?.avatar_url,
        favoritedAt: favorite.created_at, // Add when this was favorited
        sellerId: favorite.products.seller_id,
        sellerName: favorite.products.profiles?.username || 'Unknown',
        sellerRating: favorite.products.profiles?.rating || 0,
        createdAt: favorite.products.created_at
      }));

    return {
      favoritedProducts,
      error: null
    };
  } catch {
    return {
      favoritedProducts: [],
      error: 'An unexpected error occurred'
    };
  }
}) satisfies PageServerLoad;