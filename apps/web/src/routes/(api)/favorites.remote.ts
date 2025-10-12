import { command, getRequestEvent, query } from '$app/server';
import { error } from '@sveltejs/kit';
import { z } from 'zod';
import { RATE_LIMIT_CONFIGS, checkRateLimit } from '$lib/security/rate-limiter';

type ToggleFavoriteResult = {
  favorited: boolean;
  action: 'added' | 'removed';
  message: string;
  favoriteCount: number;
};

type FavoriteStatusResult = {
  isFavorited: boolean;
  favoriteCount: number;
};

type FavoriteSummaryResult = {
  counts: Record<string, number>;
  userFavorites: Record<string, boolean>;
};

const productIdSchema = z.object({
  productId: z.string().min(1, 'Product ID is required')
});

const productIdsSchema = z.object({
  productIds: z
    .array(z.string().min(1, 'Product ID is required'))
    .min(1, 'At least one product ID is required')
});

type ProductIdInput = z.infer<typeof productIdSchema>;
type ProductIdsInput = z.infer<typeof productIdsSchema>;

const processingRequests = new Map<string, Promise<ToggleFavoriteResult>>();

function ensureRateLimit(key: string, endpoint: keyof typeof RATE_LIMIT_CONFIGS) {
  const { allowed, retryAfter } = checkRateLimit(key, endpoint);

  if (!allowed) {
    const retryInSeconds = retryAfter ?? Math.ceil(
      RATE_LIMIT_CONFIGS[endpoint].windowMs / 1000
    );

    error(429, {
      message: `Too many requests. Please try again in ${retryInSeconds} seconds.`,
      code: 'RATE_LIMIT_EXCEEDED'
    });
  }
}

async function assertAuthenticated() {
  const event = getRequestEvent();
  const { locals } = event;
  const { session, user } = await locals.safeGetSession();

  if (!session || !user) {
    error(401, {
      message: 'Login required to manage favorites',
      code: 'UNAUTHORIZED'
    });
  }

  return { event, userId: user.id };
}

export const getFavoriteStatus = query(productIdSchema, async ({ productId }: ProductIdInput) => {
  const event = getRequestEvent();

  ensureRateLimit(
    `favorites-check:${event.getClientAddress()}:${productId}`,
    'apiRead'
  );

  const { locals } = event;
  const { data: product, error: productError } = await locals.supabase
    .from('products')
    .select('favorite_count')
    .eq('id', productId)
    .maybeSingle();

  if (productError) {
    error(500, {
      message: productError.message ?? 'Database error',
      code: 'DATABASE_ERROR'
    });
  }

  const { session, user } = await locals.safeGetSession();

  let isFavorited = false;

  if (session && user) {
    const { data: favorite, error: favoriteError } = await locals.supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (favoriteError) {
      error(500, {
        message: favoriteError.message ?? 'Database error',
        code: 'DATABASE_ERROR'
      });
    }

    isFavorited = Boolean(favorite);
  }

  return {
    isFavorited,
    favoriteCount: product?.favorite_count ?? 0
  } satisfies FavoriteStatusResult;
});

export const getFavoriteSummaries = query(productIdsSchema, async ({ productIds }: ProductIdsInput) => {
  const event = getRequestEvent();

  ensureRateLimit(
    `favorites-status:${event.getClientAddress()}:${productIds.join(',')}`,
    'apiRead'
  );

  const uniqueProductIds = Array.from(new Set(productIds));
  const counts: Record<string, number> = {};
  const userFavorites: Record<string, boolean> = {};

  for (const id of uniqueProductIds) {
    counts[id] = 0;
    userFavorites[id] = false;
  }

  const { locals } = event;
  const { data: products, error: productsError } = await locals.supabase
    .from('products')
    .select('id, favorite_count')
    .in('id', uniqueProductIds);

  if (productsError) {
    error(500, {
      message: productsError.message ?? 'Database error',
      code: 'DATABASE_ERROR'
    });
  }

  products?.forEach((product) => {
    counts[product.id] = product.favorite_count ?? 0;
  });

  const { session, user } = await locals.safeGetSession();

  if (session && user) {
    const { data: favorites, error: favoritesError } = await locals.supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', user.id)
      .in('product_id', uniqueProductIds);

    if (favoritesError) {
      error(500, {
        message: favoritesError.message ?? 'Database error',
        code: 'DATABASE_ERROR'
      });
    }

    favorites?.forEach((favorite) => {
      userFavorites[favorite.product_id] = true;
    });
  }

  return {
    counts,
    userFavorites
  } satisfies FavoriteSummaryResult;
});

export const listUserFavorites = query(async () => {
  const { event, userId } = await assertAuthenticated();
  const { locals } = event;

  const { data, error: favoritesError } = await locals.supabase
    .from('favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (favoritesError) {
    error(500, {
      message: favoritesError.message ?? 'Failed to fetch favorites',
      code: 'DATABASE_ERROR'
    });
  }

  return data?.map((favorite) => favorite.product_id) ?? [];
});

export const toggleFavorite = command(productIdSchema, async ({ productId }: ProductIdInput) => {
  const { event, userId } = await assertAuthenticated();

  ensureRateLimit(
    `favorites-toggle:${event.getClientAddress()}:${userId}`,
    'favorites'
  );

  const { locals } = event;
  const requestKey = `${userId}:${productId}`;

  if (processingRequests.has(requestKey)) {
    return processingRequests.get(requestKey)!;
  }

  const processRequest = (async () => {
    try {
      const { data: product, error: productError } = await locals.supabase
        .from('products')
        .select('id, is_sold, is_active')
        .eq('id', productId)
        .maybeSingle();

      if (productError || !product) {
        error(404, {
          message: 'Product not found',
          code: 'PRODUCT_NOT_FOUND'
        });
      }

      if (product.is_sold || product.is_active === false) {
        error(409, {
          message: product.is_sold
            ? 'This item has been sold and cannot be favorited'
            : 'This item is inactive and cannot be favorited',
          code: 'FAVORITE_NOT_ALLOWED'
        });
      }

      const { data: existingFavorite, error: existingFavoriteError } = await locals.supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle();

      if (existingFavoriteError) {
        error(500, {
          message: existingFavoriteError.message ?? 'Database error',
          code: 'DATABASE_ERROR'
        });
      }

      if (existingFavorite) {
        const { error: deleteError } = await locals.supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);

        if (deleteError) {
          if ('code' in deleteError && deleteError.code === '42501') {
            error(403, {
              message: 'You are not allowed to modify this favorite',
              code: 'FORBIDDEN'
            });
          }

          error(500, {
            message: deleteError.message ?? 'Failed to remove favorite',
            code: 'DATABASE_ERROR'
          });
        }

        const { data: updatedProduct, error: updatedProductError } = await locals.supabase
          .from('products')
          .select('favorite_count')
          .eq('id', productId)
          .maybeSingle();

        if (updatedProductError) {
          error(500, {
            message: updatedProductError.message ?? 'Database error',
            code: 'DATABASE_ERROR'
          });
        }

        return {
          favorited: false,
          action: 'removed',
          message: 'Removed from favorites',
          favoriteCount: updatedProduct?.favorite_count ?? 0
        } satisfies ToggleFavoriteResult;
      }

      const { error: insertError } = await locals.supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: productId
        });

      if (insertError) {
        if (insertError.code === '23505') {
          // Already favorited — continue
        } else if (insertError.code === '42501') {
          error(403, {
            message: 'You are not allowed to favorite this item',
            code: 'FORBIDDEN'
          });
        } else {
          error(500, {
            message: insertError.message ?? 'Failed to add favorite',
            code: 'DATABASE_ERROR'
          });
        }
      }

      const { data: updatedProduct, error: updatedProductError } = await locals.supabase
        .from('products')
        .select('favorite_count')
        .eq('id', productId)
        .maybeSingle();

      if (updatedProductError) {
        error(500, {
          message: updatedProductError.message ?? 'Database error',
          code: 'DATABASE_ERROR'
        });
      }

      return {
        favorited: true,
        action: 'added',
        message: 'Added to favorites',
        favoriteCount: updatedProduct?.favorite_count ?? 1
      } satisfies ToggleFavoriteResult;
    } finally {
      processingRequests.delete(requestKey);
    }
  })();

  processingRequests.set(requestKey, processRequest);
  return processRequest;
});
