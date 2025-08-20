import { vi } from 'vitest';
import type { User, Session } from '@supabase/supabase-js';

export interface MockUser extends Partial<User> {
	id: string;
	email: string;
}

export interface MockSession extends Partial<Session> {
	user: MockUser;
	access_token: string;
}

export const createMockUser = (overrides: Partial<MockUser> = {}): MockUser => ({
	id: 'test-user-id',
	email: 'test@example.com',
	created_at: '2023-01-01T00:00:00Z',
	...overrides
});

export const createMockSession = (user?: MockUser): MockSession => ({
	access_token: 'mock-access-token',
	refresh_token: 'mock-refresh-token',
	expires_in: 3600,
	token_type: 'bearer',
	user: user || createMockUser()
});

export const mockAuthState = (authenticated = true, user?: MockUser) => {
	const mockUser = user || (authenticated ? createMockUser() : null);
	const mockSession = authenticated ? createMockSession(mockUser) : null;

	return {
		user: mockUser,
		session: mockSession,
		loading: false,
		error: null
	};
};

// Common test data
export const mockProduct = {
	id: 'product-1',
	title: 'Test Product',
	description: 'A test product',
	price: 2999,
	category_id: 'category-1',
	seller_id: 'seller-1',
	images: ['https://example.com/image1.jpg'],
	condition: 'new' as const,
	size: 'M',
	brand: 'Test Brand',
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z'
};

export const mockProfile = {
	id: 'profile-1',
	username: 'testuser',
	email: 'test@example.com',
	full_name: 'Test User',
	avatar_url: 'https://example.com/avatar.jpg',
	onboarding_completed: true,
	created_at: '2023-01-01T00:00:00Z',
	updated_at: '2023-01-01T00:00:00Z'
};

export const mockCategory = {
	id: 'category-1',
	name: 'Test Category',
	slug: 'test-category',
	description: 'A test category',
	created_at: '2023-01-01T00:00:00Z'
};

// Helper to mock Supabase query responses
export const mockSupabaseResponse = <T>(data: T, error: any = null) => ({
	data,
	error,
	status: error ? 400 : 200,
	statusText: error ? 'Bad Request' : 'OK'
});

// Helper to mock Supabase auth responses
export const mockAuthResponse = (user?: MockUser, error: any = null) => {
	const mockUser = user || createMockUser();
	const mockSession = error ? null : createMockSession(mockUser);
	
	return {
		data: {
			user: error ? null : mockUser,
			session: mockSession
		},
		error
	};
};