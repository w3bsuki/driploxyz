import { vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

// Mock SvelteKit request event
export const createMockRequestEvent = (overrides: Partial<RequestEvent> = {}): RequestEvent => {
	const mockEvent: RequestEvent = {
		request: new Request('http://localhost:5173/test'),
		url: new URL('http://localhost:5173/test'),
		params: {},
		route: { id: '/test' },
		cookies: {
			get: vi.fn(),
			set: vi.fn(),
			delete: vi.fn(),
			serialize: vi.fn()
		} as any,
		locals: {
			supabase: {} as any,
			safeGetSession: vi.fn().mockResolvedValue({ session: null, user: null })
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

// Mock form data helper
export const createMockFormData = (data: Record<string, string>): FormData => {
	const formData = new FormData();
	Object.entries(data).forEach(([key, value]) => {
		formData.append(key, value);
	});
	return formData;
};

// Mock API response helper
export const createMockResponse = <T>(data: T, status = 200, headers = {}): Response => {
	return new Response(JSON.stringify(data), {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers
		}
	});
};

// Mock error response helper
export const createMockErrorResponse = (message: string, status = 400): Response => {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

// Helper to test API endpoints
export const testApiEndpoint = async (
	handler: (event: RequestEvent) => Promise<Response>,
	requestOverrides: Partial<RequestEvent> = {}
) => {
	const event = createMockRequestEvent(requestOverrides);
	return await handler(event);
};

// Mock fetch responses for external APIs
export const mockFetch = (responses: Array<{ url: string; response: Response }>) => {
	const fetchMock = vi.fn().mockImplementation((url: string) => {
		const matchingResponse = responses.find(r => url.includes(r.url));
		return Promise.resolve(matchingResponse?.response || new Response('Not Found', { status: 404 }));
	});
	
	global.fetch = fetchMock;
	return fetchMock;
};