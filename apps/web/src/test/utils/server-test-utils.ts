import { vi } from 'vitest';
import type { RequestEvent, Cookies } from '@sveltejs/kit';
import type { ActionResult } from '@sveltejs/kit';
import { mockSupabaseClient } from '../mocks/supabase.js';
import { mockStripeServer } from '../mocks/stripe.js';

// Enhanced mock for SvelteKit cookies
export const createMockCookies = (): Cookies => {
	const cookieStore = new Map<string, string>();
	
	return {
		get: vi.fn((name: string) => cookieStore.get(name) || null),
		set: vi.fn((name: string, value: string, options?: any) => {
			cookieStore.set(name, value);
		}),
		delete: vi.fn((name: string, options?: any) => {
			cookieStore.delete(name);
		}),
		serialize: vi.fn((name: string, value: string, options?: any) => 
			`${name}=${value}; Path=/`
		),
		getAll: vi.fn(() => [])
	} as Cookies;
};

// Mock authenticated user session
export const createMockAuthSession = (overrides: any = {}) => ({
	access_token: 'mock-access-token',
	refresh_token: 'mock-refresh-token',
	expires_in: 3600,
	token_type: 'bearer',
	user: {
		id: 'test-user-id',
		email: 'test@example.com',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z',
		...overrides.user
	},
	...overrides
});

// Enhanced mock for server-side RequestEvent
export const createMockServerRequestEvent = (overrides: Partial<RequestEvent> = {}): RequestEvent => {
	const mockEvent: RequestEvent = {
		request: new Request('http://localhost:5173/test', {
			method: 'GET',
			...overrides.request
		}),
		url: new URL(overrides.url || 'http://localhost:5173/test'),
		params: overrides.params || {},
		route: { id: '/test' },
		cookies: createMockCookies(),
		locals: {
			supabase: mockSupabaseClient,
			safeGetSession: vi.fn().mockResolvedValue({ 
				session: null, 
				user: null 
			}),
			...overrides.locals
		},
		fetch: vi.fn().mockResolvedValue(new Response()),
		getClientAddress: vi.fn().mockReturnValue('127.0.0.1'),
		platform: undefined,
		isDataRequest: false,
		isSubRequest: false,
		setHeaders: vi.fn(),
		...overrides
	};

	return mockEvent;
};

// Create authenticated request event
export const createAuthenticatedRequestEvent = (userOverrides: any = {}, eventOverrides: Partial<RequestEvent> = {}) => {
	const session = createMockAuthSession({ user: userOverrides });
	
	return createMockServerRequestEvent({
		...eventOverrides,
		locals: {
			supabase: mockSupabaseClient,
			safeGetSession: vi.fn().mockResolvedValue({ session, user: session.user }),
			...eventOverrides.locals
		}
	});
};

// Mock form data with proper validation
export const createValidFormData = (data: Record<string, string | File>): FormData => {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		formData.append(key, value);
	});
	return formData;
};

// Mock request with form data
export const createFormRequest = (
	formData: FormData, 
	method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): Request => {
	return new Request('http://localhost:5173/test', {
		method,
		body: formData
	});
};

// Mock JSON request
export const createJsonRequest = (
	data: any, 
	method: 'POST' | 'PUT' | 'DELETE' | 'GET' = 'POST'
): Request => {
	return new Request('http://localhost:5173/test', {
		method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: method !== 'GET' ? JSON.stringify(data) : undefined
	});
};

// Test server action helper
export const testServerAction = async (
	action: (event: RequestEvent) => Promise<ActionResult>,
	requestEvent: RequestEvent
): Promise<ActionResult> => {
	return await action(requestEvent);
};

// Test server load function helper
export const testServerLoad = async (
	loadFn: (event: RequestEvent) => Promise<any>,
	requestEvent: RequestEvent
): Promise<any> => {
	return await loadFn(requestEvent);
};

// Mock Supabase query results
export const mockSupabaseQuery = (result: any, error: any = null) => {
	const mockQuery = {
		data: result,
		error,
		count: result ? (Array.isArray(result) ? result.length : 1) : 0,
		status: error ? 500 : 200,
		statusText: error ? 'Error' : 'OK'
	};
	
	// Mock the entire query chain
	mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
	mockSupabaseClient.select.mockReturnValue(mockSupabaseClient);
	mockSupabaseClient.insert.mockReturnValue(mockSupabaseClient);
	mockSupabaseClient.update.mockReturnValue(mockSupabaseClient);
	mockSupabaseClient.delete.mockReturnValue(mockSupabaseClient);
	mockSupabaseClient.eq.mockReturnValue(mockSupabaseClient);
	mockSupabaseClient.single.mockResolvedValue(mockQuery);
	mockSupabaseClient.maybeSingle.mockResolvedValue(mockQuery);
	
	return mockQuery;
};

// Mock Stripe payment intent
export const createMockPaymentIntent = (overrides: any = {}) => ({
	id: 'pi_test_123',
	client_secret: 'pi_test_123_secret_456',
	amount: 2000,
	currency: 'usd',
	status: 'requires_payment_method',
	metadata: {
		productId: 'prod_123',
		sellerId: 'seller_123',
		buyerId: 'buyer_123',
		orderId: 'order_123',
		productPrice: '20.00',
		shippingCost: '5.00'
	},
	...overrides
});

// Mock webhook request
export const createWebhookRequest = (
	eventType: string, 
	data: any, 
	signature = 'test-signature'
): Request => {
	const webhookEvent = {
		id: 'evt_test_123',
		type: eventType,
		data: { object: data }
	};
	
	return new Request('http://localhost:5173/api/webhooks/stripe', {
		method: 'POST',
		headers: {
			'stripe-signature': signature,
			'content-type': 'application/json'
		},
		body: JSON.stringify(webhookEvent)
	});
};

// Setup rate limiting mocks
export const mockRateLimiter = () => {
	const rateLimitMock = {
		allowed: true,
		retryAfter: 0
	};
	
	vi.mock('$lib/security/rate-limiter', () => ({
		checkRateLimit: vi.fn(() => rateLimitMock),
		rateLimiter: {
			reset: vi.fn()
		}
	}));
	
	return rateLimitMock;
};

// Database test data factories
export const createTestUser = (overrides: any = {}) => ({
	id: 'user-123',
	email: 'test@example.com',
	full_name: 'Test User',
	avatar_url: null,
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z',
	...overrides
});

export const createTestProfile = (overrides: any = {}) => ({
	id: 'user-123',
	username: 'testuser',
	full_name: 'Test User',
	avatar_url: null,
	bio: null,
	location: null,
	onboarding_completed: true,
	subscription_tier: 'basic',
	subscription_status: 'active',
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z',
	...overrides
});

export const createTestProduct = (overrides: any = {}) => ({
	id: 'product-123',
	title: 'Test Product',
	description: 'A test product description',
	price: 29.99,
	images: ['https://example.com/image1.jpg'],
	brand: 'Test Brand',
	size: 'M',
	condition: 'excellent',
	category_id: 'category-123',
	category_name: 'T-Shirts',
	seller_id: 'seller-123',
	seller_username: 'testseller',
	seller_rating: 4.5,
	is_sold: false,
	status: 'active',
	location: 'Sofia, Bulgaria',
	tags: ['casual', 'cotton'],
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z',
	...overrides
});

// Assertion helpers for common test patterns
export const expectValidationError = (result: ActionResult, field?: string) => {
	expect(result.type).toBe('failure');
	expect((result as any).status).toBe(400);
	if (field) {
		expect((result as any).data.form.errors[field]).toBeDefined();
	}
};

export const expectSuccessfulAction = (result: ActionResult) => {
	expect(result.type).not.toBe('failure');
	if (result.type === 'redirect') {
		expect((result as any).status).toBeOneOf([302, 303]);
		expect((result as any).location).toBeDefined();
	}
};

export const expectAuthenticationRequired = (result: ActionResult) => {
	expect(result.type).toBe('redirect');
	expect((result as any).status).toBeOneOf([302, 303]);
	expect((result as any).location).toMatch(/\/(auth\/)?login/);
};

// Clean up mocks between tests
export const resetAllMocks = () => {
	vi.clearAllMocks();
	mockSupabaseClient.from.mockReturnValue(mockSupabaseClient);
	mockSupabaseClient.auth.getUser.mockResolvedValue({
		data: { user: null },
		error: null
	});
	mockStripeServer.paymentIntents.create.mockResolvedValue(createMockPaymentIntent());
};