import type { PageServerLoad } from './$types';
import type { Database } from '@repo/database';

type FavoriteProductImage = Pick<
  Database['public']['Tables']['product_images']['Row'],
  'id' | 'image_url' | 'alt_text' | 'sort_order'
>;

type FavoriteProductRow = Database['public']['Tables']['products']['Row'] & {
  favorite_count: number | null;
  product_images: FavoriteProductImage[] | null;
  categories: { name: string | null } | null;
  profiles: Pick<Database['public']['Tables']['profiles']['Row'], 'username' | 'rating' | 'avatar_url'> | null;
};

type FavoriteRecord = {
  product_id: string;
  created_at: string;
  products: FavoriteProductRow | null;
};

export const load = (async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    return {
      favoritedProducts: [],
      error: null
    };
  }

  try {
    // Get user's favorited products
    const { data: favorites, error: favoritesError } = await locals.supabase
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (favoritesError) {
      
      return {
        favoritedProducts: [],
        error: 'Failed to load favorites'
      };
    }

    // Transform the data to match the Product interface
    const favoriteRows = (favorites ?? []) as FavoriteRecord[];
    const favoritedProducts = favoriteRows
      .filter((favorite): favorite is FavoriteRecord & { products: FavoriteProductRow } => favorite.products !== null)
      .map((favorite) => {
        const product = favorite.products;
        const productImages = product.product_images ?? [];
        const imageUrls = productImages
          .map((img) => img.image_url)
          .filter((url): url is string => typeof url === 'string');

        return {
          ...product,
          images: imageUrls,
          product_images: productImages,
          category_name: product.categories?.name,
          seller_name: product.profiles?.username,
          seller_username: product.profiles?.username,
          seller_rating: product.profiles?.rating ?? undefined,
          seller_avatar: product.profiles?.avatar_url ?? undefined,
          favoritedAt: favorite.created_at,
          sellerId: product.seller_id,
          sellerName: product.profiles?.username ?? 'Unknown',
          sellerRating: product.profiles?.rating ?? 0,
          createdAt: product.created_at
        };
      });

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