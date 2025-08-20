import { vi } from 'vitest';

// Mock Supabase client
export const createMockSupabaseClient = () => {
	const mockUser = {
		id: 'test-user-id',
		email: 'test@example.com',
		created_at: '2023-01-01T00:00:00Z',
		updated_at: '2023-01-01T00:00:00Z'
	};

	const mockSession = {
		access_token: 'mock-access-token',
		refresh_token: 'mock-refresh-token',
		expires_in: 3600,
		token_type: 'bearer',
		user: mockUser
	};

	const mockAuthResponse = {
		data: {
			user: mockUser,
			session: mockSession
		},
		error: null
	};

	const mockClient = {
		auth: {
			getUser: vi.fn().mockResolvedValue(mockAuthResponse),
			getSession: vi.fn().mockResolvedValue({ data: { session: mockSession }, error: null }),
			signUp: vi.fn().mockResolvedValue(mockAuthResponse),
			signInWithPassword: vi.fn().mockResolvedValue(mockAuthResponse),
			signOut: vi.fn().mockResolvedValue({ error: null }),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } }
			})
		},
		from: vi.fn().mockReturnThis(),
		select: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		neq: vi.fn().mockReturnThis(),
		gt: vi.fn().mockReturnThis(),
		gte: vi.fn().mockReturnThis(),
		lt: vi.fn().mockReturnThis(),
		lte: vi.fn().mockReturnThis(),
		like: vi.fn().mockReturnThis(),
		ilike: vi.fn().mockReturnThis(),
		in: vi.fn().mockReturnThis(),
		contains: vi.fn().mockReturnThis(),
		containedBy: vi.fn().mockReturnThis(),
		rangeGt: vi.fn().mockReturnThis(),
		rangeGte: vi.fn().mockReturnThis(),
		rangeLt: vi.fn().mockReturnThis(),
		rangeLte: vi.fn().mockReturnThis(),
		rangeAdjacent: vi.fn().mockReturnThis(),
		overlaps: vi.fn().mockReturnThis(),
		textSearch: vi.fn().mockReturnThis(),
		match: vi.fn().mockReturnThis(),
		not: vi.fn().mockReturnThis(),
		filter: vi.fn().mockReturnThis(),
		or: vi.fn().mockReturnThis(),
		order: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		range: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data: null, error: null }),
		maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
		csv: vi.fn().mockResolvedValue({ data: '', error: null }),
		geojson: vi.fn().mockResolvedValue({ data: null, error: null }),
		explain: vi.fn().mockResolvedValue({ data: '', error: null }),
		rollback: vi.fn().mockResolvedValue({ data: null, error: null }),
		returns: vi.fn().mockReturnThis(),
		storage: {
			from: vi.fn().mockReturnValue({
				upload: vi.fn().mockResolvedValue({ data: null, error: null }),
				download: vi.fn().mockResolvedValue({ data: null, error: null }),
				remove: vi.fn().mockResolvedValue({ data: null, error: null }),
				list: vi.fn().mockResolvedValue({ data: [], error: null }),
				getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
				createSignedUrl: vi.fn().mockResolvedValue({ data: { signedUrl: 'https://example.com/signed' }, error: null })
			})
		},
		channel: vi.fn().mockReturnValue({
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn().mockReturnValue('ok'),
			unsubscribe: vi.fn().mockResolvedValue('ok')
		})
	};

	// Add a default successful response to common query methods
	mockClient.single.mockResolvedValue({ data: {}, error: null });
	mockClient.maybeSingle.mockResolvedValue({ data: {}, error: null });

	return mockClient;
};

// Mock the entire Supabase module
vi.mock('@supabase/supabase-js', () => ({
	createClient: vi.fn(() => createMockSupabaseClient())
}));

vi.mock('$lib/supabase/client', () => ({
	supabase: createMockSupabaseClient()
}));

vi.mock('$lib/supabase/server', () => ({
	createServerClient: vi.fn(() => createMockSupabaseClient()),
	getSession: vi.fn().mockResolvedValue({
		session: {
			user: {
				id: 'test-user-id',
				email: 'test@example.com'
			}
		}
	})
}));

export const mockSupabaseClient = createMockSupabaseClient();