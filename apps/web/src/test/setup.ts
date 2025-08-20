import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SvelteKit environment variables
vi.mock('$env/static/public', () => ({
	PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
	PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
	PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_stripe_key'
}));

vi.mock('$env/static/private', () => ({
	SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
	STRIPE_SECRET_KEY: 'sk_test_stripe_secret'
}));

vi.mock('$env/dynamic/public', () => ({
	env: {
		PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
		PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
	}
}));

// Mock SvelteKit stores
vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn(() => vi.fn())
	},
	navigating: {
		subscribe: vi.fn(() => vi.fn())
	},
	updated: {
		subscribe: vi.fn(() => vi.fn())
	}
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
	observe: vi.fn(),
	unobserve: vi.fn(),
	disconnect: vi.fn()
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn()
	}))
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
	writable: true,
	value: vi.fn()
});

// Mock SvelteKit app paths
vi.mock('$app/paths', () => ({
	base: '',
	assets: ''
}));

// Mock SvelteKit navigation
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn(),
	afterNavigate: vi.fn(),
	beforeNavigate: vi.fn(),
	onNavigate: vi.fn()
}));

// Mock file constructor for upload tests
global.File = class MockFile {
	constructor(
		public content: any[], 
		public name: string, 
		public options: any = {}
	) {
		this.size = content.length;
		this.type = options.type || '';
		this.lastModified = Date.now();
	}
	
	size: number;
	type: string;
	lastModified: number;
} as any;

// Mock FormData for server-side tests
if (typeof FormData === 'undefined') {
	global.FormData = class MockFormData {
		private data: Map<string, any> = new Map();
		
		append(key: string, value: any) {
			this.data.set(key, value);
		}
		
		get(key: string) {
			return this.data.get(key);
		}
		
		has(key: string) {
			return this.data.has(key);
		}
		
		delete(key: string) {
			this.data.delete(key);
		}
		
		entries() {
			return this.data.entries();
		}
	} as any;
}

// Mock crypto for webhook signature verification
Object.defineProperty(global, 'crypto', {
	value: {
		subtle: {
			digest: vi.fn().mockResolvedValue(new ArrayBuffer(32))
		},
		randomUUID: vi.fn(() => 'mock-uuid-1234-5678-9012')
	}
});