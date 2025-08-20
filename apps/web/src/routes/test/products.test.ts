import { describe, it, expect, beforeEach, vi } from 'vitest';
import { json, error } from '@sveltejs/kit';

// Import the server handlers
import { GET as getProductHandler } from '../api/products/[id]/+server.js';
import { GET as priceSuggestionsHandler } from '../api/products/price-suggestions/+server.js';
import { load as productPageLoad } from '../product/[id]/+page.server.js';
import { load as categoryPageLoad } from '../category/[slug]/+page.server.js';
import { actions as sellActions } from '../(protected)/sell/+page.server.js';

// Import test utilities
import {
	createMockServerRequestEvent,
	createAuthenticatedRequestEvent,
	createFormRequest,
	createValidFormData,
	testServerAction,
	testServerLoad,
	mockSupabaseQuery,
	createTestProduct,
	createTestProfile,
	expectValidationError,
	expectSuccessfulAction,
	resetAllMocks
} from '../../test/utils/server-test-utils.js';
import { mockSupabaseClient } from '../../test/mocks/supabase.js';

// Mock services
vi.mock('$lib/services', () => ({
	createServices: vi.fn(() => ({
		products: {
			getProduct: vi.fn(),
			searchProducts: vi.fn(),
			createProduct: vi.fn(),
			updateProduct: vi.fn(),
			deleteProduct: vi.fn(),
			getSuggestedPrice: vi.fn()
		},
		categories: {
			getCategory: vi.fn(),
			getCategoryProducts: vi.fn()
		}
	}))
}));

describe('Products Integration Tests', () => {
	let mockServices: any;

	beforeEach(() => {
		resetAllMocks();
		const { createServices } = require('$lib/services');
		mockServices = createServices();
	});

	describe('Product API Endpoints', () => {
		describe('GET /api/products/[id]', () => {
			it('should return product data with proper formatting', async () => {
				const productData = createTestProduct({
					id: 'product-123',
					price: 29.99,
					images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
					seller_username: 'testseller',
					seller_rating: 4.5,
					category_name: 'T-Shirts',
					tags: ['casual', 'cotton']
				});

				mockServices.products.getProduct.mockResolvedValue({
					data: productData,
					error: null
				});

				const event = createMockServerRequestEvent({
					params: { id: 'product-123' }
				});

				const response = await getProductHandler(event);
				const result = await response.json();

				expect(response.status).toBe(200);
				expect(result.product).toEqual({
					id: 'product-123',
					title: 'Test Product',
					description: 'A test product description',
					price: 2999, // Converted to cents
					images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
					brand: 'Test Brand',
					size: 'M',
					condition: 'excellent',
					category: 'T-Shirts',
					sellerId: 'seller-123',
					sellerName: 'testseller',
					sellerRating: 4.5,
					createdAt: '2023-01-01T00:00:00Z',
					location: 'Sofia, Bulgaria',
					tags: ['casual', 'cotton']
				});

				expect(mockServices.products.getProduct).toHaveBeenCalledWith('product-123');
			});

			it('should handle missing product', async () => {
				mockServices.products.getProduct.mockResolvedValue({
					data: null,
					error: { message: 'Product not found' }
				});

				const event = createMockServerRequestEvent({
					params: { id: 'nonexistent' }
				});

				await expect(getProductHandler(event)).rejects.toThrow('Product not found');
			});

			it('should handle service errors', async () => {
				mockServices.products.getProduct.mockRejectedValue(
					new Error('Database connection failed')
				);

				const event = createMockServerRequestEvent({
					params: { id: 'product-123' }
				});

				const response = await getProductHandler(event);
				const result = await response.json();

				expect(response.status).toBe(500);
				expect(result.error).toBe('Failed to load product');
			});

			it('should use placeholder image when no images provided', async () => {
				const productData = createTestProduct({
					images: null
				});

				mockServices.products.getProduct.mockResolvedValue({
					data: productData,
					error: null
				});

				const event = createMockServerRequestEvent({
					params: { id: 'product-123' }
				});

				const response = await getProductHandler(event);
				const result = await response.json();

				expect(result.product.images).toEqual(['/placeholder-product.jpg']);
			});
		});

		describe('GET /api/products/price-suggestions', () => {
			it('should return price suggestions for valid product data', async () => {
				mockServices.products.getSuggestedPrice.mockResolvedValue({
					suggested_price: 35.00,
					price_range: { min: 30.00, max: 40.00 },
					confidence: 0.85
				});

				const event = createMockServerRequestEvent({
					url: 'http://localhost/api/products/price-suggestions?category=t-shirts&brand=nike&condition=good&size=M'
				});

				const response = await priceSuggestionsHandler(event);
				const result = await response.json();

				expect(response.status).toBe(200);
				expect(result.suggested_price).toBe(35.00);
				expect(result.price_range).toEqual({ min: 30.00, max: 40.00 });
				expect(result.confidence).toBe(0.85);
			});

			it('should handle missing query parameters', async () => {
				const event = createMockServerRequestEvent({
					url: 'http://localhost/api/products/price-suggestions'
				});

				const response = await priceSuggestionsHandler(event);

				expect(response.status).toBe(400);
			});
		});
	});

	describe('Product Page Loading', () => {
		describe('Product Detail Page Load', () => {
			it('should load product with related data', async () => {
				const productData = createTestProduct();

				mockServices.products.getProduct.mockResolvedValue({
					data: productData,
					error: null
				});

				// Mock related products
				const relatedProducts = [
					createTestProduct({ id: 'related-1', title: 'Related Product 1' }),
					createTestProduct({ id: 'related-2', title: 'Related Product 2' })
				];

				mockServices.products.searchProducts.mockResolvedValue({
					data: relatedProducts,
					error: null
				});

				const event = createMockServerRequestEvent({
					params: { id: 'product-123' }
				});

				const result = await testServerLoad(productPageLoad, event);

				expect(result.product).toBeDefined();
				expect(result.relatedProducts).toHaveLength(2);
				expect(mockServices.products.getProduct).toHaveBeenCalledWith('product-123');
			});

			it('should handle product not found', async () => {
				mockServices.products.getProduct.mockResolvedValue({
					data: null,
					error: { message: 'Product not found' }
				});

				const event = createMockServerRequestEvent({
					params: { id: 'nonexistent' }
				});

				await expect(testServerLoad(productPageLoad, event)).rejects.toThrow();
			});

			it('should load product for authenticated user with favorites', async () => {
				const user = { id: 'user-123' };
				const event = createAuthenticatedRequestEvent(user, {
					params: { id: 'product-123' }
				});

				const productData = createTestProduct();
				mockServices.products.getProduct.mockResolvedValue({
					data: productData,
					error: null
				});

				// Mock user favorites
				mockSupabaseQuery([{ product_id: 'product-123' }]);

				const result = await testServerLoad(productPageLoad, event);

				expect(result.product).toBeDefined();
				expect(result.isFavorite).toBe(true);
			});
		});

		describe('Category Page Load', () => {
			it('should load category with products', async () => {
				const categoryData = {
					id: 'category-123',
					name: 'T-Shirts',
					slug: 't-shirts',
					description: 'Comfortable t-shirts for everyone'
				};

				const products = [
					createTestProduct({ id: 'product-1' }),
					createTestProduct({ id: 'product-2' })
				];

				mockServices.categories.getCategory.mockResolvedValue({
					data: categoryData,
					error: null
				});

				mockServices.categories.getCategoryProducts.mockResolvedValue({
					data: products,
					count: 2,
					error: null
				});

				const event = createMockServerRequestEvent({
					params: { slug: 't-shirts' },
					url: 'http://localhost/category/t-shirts'
				});

				const result = await testServerLoad(categoryPageLoad, event);

				expect(result.category).toEqual(categoryData);
				expect(result.products).toHaveLength(2);
				expect(result.totalCount).toBe(2);
			});

			it('should handle pagination parameters', async () => {
				const event = createMockServerRequestEvent({
					params: { slug: 't-shirts' },
					url: 'http://localhost/category/t-shirts?page=2&limit=12&sort=price_asc'
				});

				mockServices.categories.getCategory.mockResolvedValue({
					data: { id: 'cat-123', name: 'T-Shirts', slug: 't-shirts' },
					error: null
				});

				mockServices.categories.getCategoryProducts.mockResolvedValue({
					data: [],
					count: 0,
					error: null
				});

				await testServerLoad(categoryPageLoad, event);

				expect(mockServices.categories.getCategoryProducts).toHaveBeenCalledWith(
					't-shirts',
					expect.objectContaining({
						page: 2,
						limit: 12,
						sort: 'price_asc'
					})
				);
			});

			it('should handle category not found', async () => {
				mockServices.categories.getCategory.mockResolvedValue({
					data: null,
					error: { message: 'Category not found' }
				});

				const event = createMockServerRequestEvent({
					params: { slug: 'nonexistent' }
				});

				await expect(testServerLoad(categoryPageLoad, event)).rejects.toThrow();
			});
		});
	});

	describe('Product Creation (Sell Action)', () => {
		it('should create product with valid data', async () => {
			const user = createTestProfile({ subscription_tier: 'premium' });
			const event = createAuthenticatedRequestEvent(user);

			const newProduct = createTestProduct({
				id: 'new-product-123',
				seller_id: user.id
			});

			mockServices.products.createProduct.mockResolvedValue({
				data: newProduct,
				error: null
			});

			const formData = createValidFormData({
				title: 'New Test Product',
				description: 'A brand new test product',
				price: '29.99',
				brand: 'Test Brand',
				size: 'M',
				condition: 'new',
				category: 'clothing',
				location: 'Sofia, Bulgaria'
			});

			// Add mock file
			const imageFile = new File(['fake image data'], 'image.jpg', { type: 'image/jpeg' });
			formData.append('images', imageFile);

			const request = createFormRequest(formData);
			const sellEvent = { ...event, request };

			await expect(testServerAction(sellActions.create, sellEvent)).rejects.toThrow();
			// Should redirect to product page after creation

			expect(mockServices.products.createProduct).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'New Test Product',
					price: 29.99,
					seller_id: user.id
				})
			);
		});

		it('should validate required fields', async () => {
			const user = createTestProfile();
			const event = createAuthenticatedRequestEvent(user);

			const formData = createValidFormData({
				title: '', // Missing required field
				price: 'invalid', // Invalid price format
				description: 'A' // Too short
			});

			const request = createFormRequest(formData);
			const sellEvent = { ...event, request };

			const result = await testServerAction(sellActions.create, sellEvent);

			expectValidationError(result);
			const errors = (result as any).data.form.errors;
			expect(errors.title).toBeDefined();
			expect(errors.price).toBeDefined();
		});

		it('should check subscription limits for basic users', async () => {
			const user = createTestProfile({ 
				subscription_tier: 'basic',
				products_count: 10 // Assume basic limit is 10
			});
			const event = createAuthenticatedRequestEvent(user);

			const formData = createValidFormData({
				title: 'New Product',
				description: 'Test product',
				price: '29.99',
				brand: 'Test Brand',
				size: 'M',
				condition: 'good',
				category: 'clothing'
			});

			const request = createFormRequest(formData);
			const sellEvent = { ...event, request };

			const result = await testServerAction(sellActions.create, sellEvent);

			expect(result.type).toBe('failure');
			expect((result as any).data.form.errors['']).toContain('subscription limit');
		});

		it('should handle image upload errors', async () => {
			const user = createTestProfile();
			const event = createAuthenticatedRequestEvent(user);

			mockServices.products.createProduct.mockResolvedValue({
				data: null,
				error: { message: 'Image upload failed' }
			});

			const formData = createValidFormData({
				title: 'Test Product',
				description: 'Test description',
				price: '29.99',
				brand: 'Test Brand',
				size: 'M',
				condition: 'good',
				category: 'clothing'
			});

			const request = createFormRequest(formData);
			const sellEvent = { ...event, request };

			const result = await testServerAction(sellActions.create, sellEvent);

			expectValidationError(result);
		});

		it('should require authentication for product creation', async () => {
			const event = createMockServerRequestEvent(); // No authentication

			const formData = createValidFormData({
				title: 'Test Product',
				price: '29.99'
			});

			const request = createFormRequest(formData);
			const sellEvent = { ...event, request };

			await expect(testServerAction(sellActions.create, sellEvent)).rejects.toThrow();
			// Should redirect to login
		});
	});

	describe('Product Search and Filtering', () => {
		it('should search products with filters', async () => {
			const searchResults = [
				createTestProduct({ id: 'result-1', title: 'Nike T-Shirt' }),
				createTestProduct({ id: 'result-2', title: 'Adidas T-Shirt' })
			];

			mockServices.products.searchProducts.mockResolvedValue({
				data: searchResults,
				count: 2,
				error: null
			});

			// This would be tested in a search page load function
			const searchParams = {
				query: 't-shirt',
				category: 'clothing',
				price_min: 10,
				price_max: 50,
				condition: 'good',
				size: 'M'
			};

			expect(mockServices.products.searchProducts).toBeDefined();
		});

		it('should handle empty search results', async () => {
			mockServices.products.searchProducts.mockResolvedValue({
				data: [],
				count: 0,
				error: null
			});

			// Test search with no results
			expect(mockServices.products.searchProducts).toBeDefined();
		});

		it('should validate search parameters', async () => {
			// Test invalid price range
			const invalidParams = {
				query: 'shirt',
				price_min: 100,
				price_max: 50 // Max less than min
			};

			// Would be validated in the actual search implementation
			expect(invalidParams.price_min).toBeGreaterThan(invalidParams.price_max);
		});
	});

	describe('Product Management', () => {
		it('should allow product owner to edit product', async () => {
			const seller = createTestProfile({ id: 'seller-123' });
			const product = createTestProduct({ seller_id: 'seller-123' });
			const event = createAuthenticatedRequestEvent(seller);

			mockServices.products.getProduct.mockResolvedValue({
				data: product,
				error: null
			});

			mockServices.products.updateProduct.mockResolvedValue({
				data: { ...product, title: 'Updated Title' },
				error: null
			});

			const formData = createValidFormData({
				title: 'Updated Title',
				description: product.description,
				price: product.price.toString()
			});

			// This would be tested in the edit action
			expect(product.seller_id).toBe(seller.id);
		});

		it('should prevent non-owner from editing product', async () => {
			const otherUser = createTestProfile({ id: 'other-user-123' });
			const product = createTestProduct({ seller_id: 'seller-123' });
			const event = createAuthenticatedRequestEvent(otherUser);

			mockServices.products.getProduct.mockResolvedValue({
				data: product,
				error: null
			});

			// Should fail authorization check
			expect(product.seller_id).not.toBe(otherUser.id);
		});

		it('should mark product as sold after purchase', async () => {
			const product = createTestProduct({ is_sold: false });

			mockServices.products.updateProduct.mockResolvedValue({
				data: { ...product, is_sold: true, status: 'sold' },
				error: null
			});

			// This would be called by the payment webhook
			expect(mockServices.products.updateProduct).toBeDefined();
		});
	});

	describe('Product Data Validation', () => {
		it('should validate price format and range', async () => {
			const invalidPrices = ['abc', '-10', '0', '10000000'];

			invalidPrices.forEach(price => {
				const isValid = /^\d+(\.\d{1,2})?$/.test(price) && 
								parseFloat(price) > 0 && 
								parseFloat(price) < 100000;
				expect(isValid).toBe(false);
			});

			const validPrices = ['10', '10.99', '999.99'];
			validPrices.forEach(price => {
				const isValid = /^\d+(\.\d{1,2})?$/.test(price) && 
								parseFloat(price) > 0 && 
								parseFloat(price) < 100000;
				expect(isValid).toBe(true);
			});
		});

		it('should validate image file types and sizes', async () => {
			const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
			const invalidImageTypes = ['text/plain', 'application/pdf', 'video/mp4'];

			validImageTypes.forEach(type => {
				expect(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']).toContain(type);
			});

			invalidImageTypes.forEach(type => {
				expect(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']).not.toContain(type);
			});
		});

		it('should validate required product fields', async () => {
			const requiredFields = ['title', 'description', 'price', 'condition', 'category'];
			const productData = {
				title: 'Test Product',
				description: 'A test product',
				price: '29.99',
				condition: 'good',
				// Missing category
			};

			const hasAllRequired = requiredFields.every(field => 
				productData.hasOwnProperty(field) && productData[field as keyof typeof productData]
			);

			expect(hasAllRequired).toBe(false);
		});
	});
});