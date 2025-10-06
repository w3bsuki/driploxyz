import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';
import { ProductService, type ProductWithImages, type ProductFilters, type ProductSort } from './products';

export interface SearchOptions {
	limit?: number;
	country_code?: string;
	category_ids?: string[];
	min_price?: number;
	max_price?: number;
	conditions?: string[];
	sizes?: string[];
	brands?: string[];
	sort?: { by: 'created_at' | 'price' | 'popularity' | 'relevance'; direction: 'asc' | 'desc' };
	offset?: number;
}

export interface SearchResult {
	data: ProductWithImages[];
	error?: string | null;
	total?: number;
}

export class ProductDomainAdapter {
	private productService: ProductService;
	private supabase: SupabaseClient<Database>;

	constructor(supabase: SupabaseClient<Database>) {
		this.supabase = supabase;
		this.productService = new ProductService(supabase);
	}

	/**
	 * Get a product by ID
	 */
	async getProduct(id: string): Promise<SearchResult> {
		const result = await this.productService.getProduct(id);
		return {
			data: result.data ? [result.data] : [],
			error: result.error
		};
	}

	/**
	 * Get products with filters
	 */
	async getProducts(options: SearchOptions): Promise<SearchResult> {
		const { limit = 20, offset = 0, sort, ...filters } = options;
		
		const productOptions = {
			filters: filters as ProductFilters,
			sort: sort as ProductSort,
			limit,
			offset
		};

		const result = await this.productService.getProducts(productOptions);
		return {
			data: result.data,
			error: result.error,
			total: result.total
		};
	}

	/**
	 * Get products by category
	 */
	async getProductsByCategory(categoryId: string, options: {
		includeDescendants?: boolean;
		limit?: number;
		offset?: number;
		sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' };
		country?: string;
	}): Promise<SearchResult> {
		const { limit = 20, offset = 0, sort, country } = options;
		
		const filters = {
			category_id: categoryId,
			country_code: country,
			include_descendants: true
		};

		const result = await this.productService.getHierarchicalProducts(
			filters,
			sort,
			limit,
			offset
		);

		return {
			data: result.data,
			error: result.error,
			total: result.total
		};
	}

	/**
	 * Get seller's products
	 */
	async getSellerProducts(sellerId: string, options: {
		limit?: number;
		sort?: { by: 'created_at' | 'price' | 'popularity'; direction: 'asc' | 'desc' };
	}): Promise<SearchResult> {
		const { limit = 20, sort } = options;
		
		const result = await this.productService.getSellerProducts(sellerId, {
			limit,
			sort
		});

		return {
			data: result.data,
			error: result.error
		};
	}

	/**
	 * Search products with filters
	 */
	async searchProductsWithFilters(query: string, options: SearchOptions): Promise<SearchResult> {
		const { limit = 20, offset = 0, sort, ...filters } = options;
		
		// If query is empty, just use regular getProducts
		if (!query.trim()) {
			return this.getProducts(options);
		}

		const productOptions = {
			filters: {
				...filters as ProductFilters,
				search: query
			},
			sort: sort as ProductSort,
			limit,
			offset
		};

		const result = await this.productService.getProducts(productOptions);
		return {
			data: result.data,
			error: result.error,
			total: result.total
		};
	}

	/**
	 * Resolve category segments for breadcrumbs
	 */
	resolveCategorySegments = {
		execute: async (segments: string[]): Promise<{ success: boolean; data: string[]; error?: string }> => {
			try {
				// This would implement the category resolution logic
				// For now, return empty array as placeholder
				return {
					success: true,
					data: []
				};
			} catch (error) {
				return {
					success: false,
					data: [],
					error: error instanceof Error ? error.message : String(error)
				};
			}
		}
	};
}

/**
 * Factory function to create a ProductDomainAdapter
 */
export function getProductAdapter(locals: { supabase: SupabaseClient<Database> }) {
	return new ProductDomainAdapter(locals.supabase);
}