import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRequestEvent, createMockFormData, testApiEndpoint } from '../utils/api-utils.js';
import { mockSupabaseClient } from '../mocks/supabase.js';

// Mock API handler for testing
const exampleApiHandler = async (event: any) => {
	const { request } = event;
	
	if (request.method === 'GET') {
		return new Response(JSON.stringify({ message: 'Hello World' }), {
			status: 200,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	if (request.method === 'POST') {
		const formData = await request.formData();
		const name = formData.get('name');
		
		if (!name) {
			return new Response(JSON.stringify({ error: 'Name is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		
		return new Response(JSON.stringify({ message: `Hello ${name}` }), {
			status: 201,
			headers: { 'Content-Type': 'application/json' }
		});
	}
	
	return new Response('Method not allowed', { status: 405 });
};

describe('Example API Testing', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should handle GET requests', async () => {
		const response = await testApiEndpoint(exampleApiHandler, {
			request: new Request('http://localhost:5173/api/example', {
				method: 'GET'
			})
		});

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual({ message: 'Hello World' });
	});

	it('should handle POST requests with valid data', async () => {
		const formData = createMockFormData({ name: 'Test User' });
		
		const response = await testApiEndpoint(exampleApiHandler, {
			request: new Request('http://localhost:5173/api/example', {
				method: 'POST',
				body: formData
			})
		});

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual({ message: 'Hello Test User' });
	});

	it('should handle POST requests with invalid data', async () => {
		const formData = createMockFormData({});
		
		const response = await testApiEndpoint(exampleApiHandler, {
			request: new Request('http://localhost:5173/api/example', {
				method: 'POST',
				body: formData
			})
		});

		expect(response.status).toBe(400);
		const data = await response.json();
		expect(data).toEqual({ error: 'Name is required' });
	});

	it('should handle unsupported methods', async () => {
		const response = await testApiEndpoint(exampleApiHandler, {
			request: new Request('http://localhost:5173/api/example', {
				method: 'DELETE'
			})
		});

		expect(response.status).toBe(405);
	});

	it('should work with mocked Supabase client', async () => {
		// Test that our Supabase mocks are working
		const { data, error } = await mockSupabaseClient.from('products').select('*');
		
		expect(mockSupabaseClient.from).toHaveBeenCalledWith('products');
		expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
	});
});