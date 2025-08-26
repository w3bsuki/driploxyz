import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
	browser: false,
	dev: true,
	building: false,
	version: 'test'
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn()
	},
	navigating: {
		subscribe: vi.fn()
	}
}));