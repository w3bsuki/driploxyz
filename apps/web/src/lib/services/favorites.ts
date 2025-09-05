import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

type Tables = Database['public']['Tables'];
type Favorite = Tables['favorites']['Row'];

export interface FavoriteWithProduct extends Favorite {
  products?: {
    id: string;
    title: string;
    price: number;
    is_sold: boolean | null;
    sold_at: string | null;
    seller_id: string;
    product_images?: { image_url: string }[];
    profiles?: {
      username: string | null;
      avatar_url?: string | null;
    };
  };
}

export class FavoriteService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get user's favorites with product details
   */
  async getUserFavorites(userId: string): Promise<{
    data: FavoriteWithProduct[] | null;
    error: Error | null;
  }> {
    try {
      // Get favorites first
      const { data: favorites, error: favoritesError } = await this.supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (favoritesError) throw favoritesError;

      if (!favorites || favorites.length === 0) {
        return { data: [], error: null };
      }

      // Get products separately  
      const productIds = favorites.map(f => f.product_id);
      const { data: products, error: productsError } = await this.supabase
        .from('products')
        .select(`
          id,
          title, 
          price,
          is_sold,
          sold_at,
          seller_id
        `)
        .in('id', productIds);

      if (productsError) throw productsError;

      // Combine the data manually
      const result: FavoriteWithProduct[] = favorites.map(favorite => ({
        ...favorite,
        products: products?.find(p => p.id === favorite.product_id) || undefined
      }));

      return { data: result, error: null };
    } catch (error) {
      // Error fetching user favorites
      return { data: null, error: error as Error };
    }
  }

  /**
   * Check if user has favorited a specific product
   */
  async isFavorited(userId: string, productId: string): Promise<{
    isFavorited: boolean;
    error: Error | null;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned

      return { isFavorited: !!data, error: null };
    } catch (error) {
      // Error checking favorite status
      return { isFavorited: false, error: error as Error };
    }
  }

  /**
   * Add product to favorites
   */
  async addToFavorites(userId: string, productId: string): Promise<{
    data: Favorite | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: productId
        })
        .select()
        .single();

      if (error) throw error;

      // Update product favorite count
      await this.updateProductFavoriteCount(productId);

      return { data, error: null };
    } catch (error) {
      // Error adding to favorites
      return { data: null, error: error as Error };
    }
  }

  /**
   * Remove product from favorites
   */
  async removeFromFavorites(userId: string, productId: string): Promise<{
    success: boolean;
    error: Error | null;
  }> {
    try {
      const { error } = await this.supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;

      // Update product favorite count
      await this.updateProductFavoriteCount(productId);

      return { success: true, error: null };
    } catch (error) {
      // Error removing from favorites
      return { success: false, error: error as Error };
    }
  }

  /**
   * Toggle favorite status for a product
   */
  async toggleFavorite(userId: string, productId: string): Promise<{
    isFavorited: boolean;
    error: Error | null;
  }> {
    try {
      const { isFavorited, error: checkError } = await this.isFavorited(userId, productId);
      
      if (checkError) throw checkError;

      if (isFavorited) {
        const { error: removeError } = await this.removeFromFavorites(userId, productId);
        if (removeError) throw removeError;
        return { isFavorited: false, error: null };
      } else {
        const { error: addError } = await this.addToFavorites(userId, productId);
        if (addError) throw addError;
        return { isFavorited: true, error: null };
      }
    } catch (error) {
      // Error toggling favorite
      return { isFavorited: false, error: error as Error };
    }
  }

  /**
   * Get favorite count for a product
   */
  async getProductFavoriteCount(productId: string): Promise<{
    count: number;
    error: Error | null;
  }> {
    try {
      const { count, error } = await this.supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      if (error) throw error;

      return { count: count || 0, error: null };
    } catch (error) {
      // Error getting favorite count
      return { count: 0, error: error as Error };
    }
  }

  /**
   * Update product favorite count in products table
   */
  private async updateProductFavoriteCount(productId: string): Promise<void> {
    try {
      const { count } = await this.getProductFavoriteCount(productId);

      await this.supabase
        .from('products')
        .update({ favorite_count: count })
        .eq('id', productId);
    } catch (error) {
      // Error updating product favorite count
    }
  }

  /**
   * Clean up sold products from favorites (mark for removal after 1 hour)
   */
  async cleanupSoldFavorites(): Promise<{
    removedCount: number;
    error: Error | null;
  }> {
    try {
      // Remove favorites for products sold more than 1 hour ago
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const { data: _data, error } = await this.supabase
        .from('favorites')
        .delete()
        .eq('products.is_sold', true)
        .lt('products.sold_at', oneHourAgo);

      if (error) throw error;

      return { removedCount: 0, error: null };
    } catch (error) {
      // Error cleaning up sold favorites
      return { removedCount: 0, error: error as Error };
    }
  }

  /**
   * Get sold items in user's favorites that should show "Sold" status
   */
  async getSoldFavoritesForUser(userId: string): Promise<{
    data: FavoriteWithProduct[] | null;
    error: Error | null;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .select(`
          *,
          products!product_id (
            id,
            title,
            price,
            is_sold,
            sold_at,
            seller_id,
            product_images!product_id (image_url),
            profiles!seller_id (
              username,
              avatar_url
            )
          )
        `)
        .eq('user_id', userId)
        .eq('products.is_sold', true)
        .order('products.sold_at', { ascending: false });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      // Error fetching sold favorites
      return { data: null, error: error as Error };
    }
  }

  /**
   * Get multiple favorite statuses for products (for displaying in product grids)
   */
  async getMultipleFavoriteStatuses(
    userId: string, 
    productIds: string[]
  ): Promise<{
    favorites: Record<string, boolean>;
    error: Error | null;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', userId)
        .in('product_id', productIds);

      if (error) throw error;

      const favorites = Object.fromEntries(
        productIds.map(id => [id, false])
      );

      data?.forEach(fav => {
        favorites[fav.product_id] = true;
      });

      return { favorites, error: null };
    } catch (error) {
      // Error fetching multiple favorite statuses
      return { 
        favorites: Object.fromEntries(productIds.map(id => [id, false])), 
        error: error as Error 
      };
    }
  }
}