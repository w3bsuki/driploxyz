import { useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, TextInput, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SearchProducts } from '@repo/domain/products';
import type { Product } from '@repo/domain/products';
import { supabase } from '@repo/mobile-shared';

// Repository implementation for React Native
class ProductRepository {
  async getById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(*), images:product_images(*), category:categories(*)')
      .eq('id', id)
      .single();
    
    if (error) return { success: false, error: { code: 'NOT_FOUND', message: error.message } };
    return { success: true, data };
  }

  async getBySlugAndSeller(slug: string, sellerUsername: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(*), images:product_images(*), category:categories(*)')
      .eq('slug', slug)
      .eq('seller.username', sellerUsername)
      .single();
    
    if (error) return { success: false, error: { code: 'NOT_FOUND', message: error.message } };
    return { success: true, data };
  }

  async getBySeller(sellerId: string, options?: { limit?: number; offset?: number; sort?: { by: string; direction: string } }) {
    let query = supabase
      .from('products')
      .select('*, seller:profiles!seller_id(*), images:product_images(*), category:categories(*)')
      .eq('seller_id', sellerId);

    if (options?.sort) {
      query = query.order(options.sort.by, { ascending: options.sort.direction === 'asc' });
    }

    const { data, error } = await query
      .range(options?.offset || 0, (options?.offset || 0) + (options?.limit || 20) - 1);
    
    if (error) return { success: false as const, error: { code: 'VALIDATION_ERROR', message: error.message } as any };
    return { success: true as const, data: data || [] };
  }

  async getPromoted(limit: number) {
    const { data, error } = await supabase
      .from('products')
      .select('*, seller:profiles!seller_id(*), images:product_images(*), category:categories(*)')
      .eq('is_active', true)
      .eq('is_sold', false)
      .order('view_count', { ascending: false })
      .limit(limit);
    
    if (error) return { success: false, error: { code: 'VALIDATION_ERROR', message: error.message } };
    return { success: true, data: data || [] };
  }

  async search(params: any) {
    try {
      let query = supabase
        .from('products')
        .select('*, seller:profiles!seller_id(*), images:product_images(*), category:categories(*)')
        .eq('is_active', true)
        .eq('is_sold', false)
        .order(params.sort?.by || 'created_at', { 
          ascending: params.sort?.direction === 'asc' 
        });

      if (params.query) {
        query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
      }

      if (params.category_ids && params.category_ids.length > 0) {
        query = query.in('category_id', params.category_ids);
      }

      if (params.min_price !== undefined) {
        query = query.gte('price', params.min_price);
      }

      if (params.max_price !== undefined) {
        query = query.lte('price', params.max_price);
      }

      if (params.conditions && params.conditions.length > 0) {
        query = query.in('condition', params.conditions);
      }

      const { data, error, count } = await query
        .range(params.offset || 0, (params.offset || 0) + (params.limit || 20) - 1);

      if (error) throw error;

      return {
        success: true,
        data: {
          products: data || [],
          total: count || 0,
          limit: params.limit || 20,
          offset: params.offset || 0
        }
      };
    } catch (error) {
      return {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}

const searchProductsService = new SearchProducts(new ProductRepository() as any);

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      const result = await searchProductsService.execute({
        query: searchQuery || undefined,
        limit: 20,
        offset: 0,
        sort: { by: 'created_at', direction: 'desc' }
      });

      if (!result.success) {
        throw new Error('Failed to fetch products');
      }

      return result.data;
    },
  });

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard}>
      {item.images && item.images.length > 0 && (
        <Image
          source={{ uri: item.images[0].image_url }}
          style={styles.productImage}
          resizeMode='cover'
        />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.productPrice}>
          {item.price.currency === 'EUR' ? '€' : '$'}{(item.price.amount / 100).toFixed(2)}
        </Text>
        <Text style={styles.productCondition}>{item.condition}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <TextInput
          style={styles.searchInput}
          placeholder='Search products...'
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => refetch()}
        />
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size='large' color='#007AFF' />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Failed to load products</Text>
          <TouchableOpacity onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={data?.products || []}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => refetch()} />
          }
          ListEmptyComponent={
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    maxWidth: '47%',
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  productCondition: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
});
