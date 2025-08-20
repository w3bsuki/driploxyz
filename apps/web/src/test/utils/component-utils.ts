import { render, type RenderResult, fireEvent } from '@testing-library/svelte';
import { vi } from 'vitest';
import type { ComponentType } from 'svelte';

// Re-export test utilities from packages/ui for consistency
export {
  createMockHandlers,
  userInteraction,
  checkAccessibility,
  setupGlobalMocks,
  waitForSvelteUpdate,
  mockTranslations
} from '../../../../packages/ui/src/test/test-utils.js';

// App-specific test utilities
export const renderSvelte5Component = <T extends Record<string, any>>(
  Component: ComponentType,
  props?: T,
  options?: {
    container?: HTMLElement;
    target?: HTMLElement;
  }
): RenderResult<T> => {
  const container = options?.container || document.createElement('div');
  document.body.appendChild(container);
  
  const result = render(Component, {
    props: props || {},
    target: options?.target || container
  });

  const originalUnmount = result.unmount;
  result.unmount = () => {
    originalUnmount();
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  };

  return result as RenderResult<T>;
};

// Mock auth user factory
export const createMockAuthUser = (overrides?: any) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
});

// Mock auth profile factory
export const createMockAuthProfile = (overrides?: any) => ({
  id: 'test-profile-id',
  user_id: 'test-user-id',
  username: 'testuser',
  display_name: 'Test User',
  avatar_url: 'https://example.com/avatar.jpg',
  bio: 'Test bio',
  onboarding_completed: true,
  account_type: 'buyer',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides
});

// Mock notification factory
export const createMockNotification = (overrides?: any) => ({
  id: 'notification-1',
  user_id: 'test-user-id',
  type: 'message',
  title: 'New message',
  message: 'You have a new message',
  data: {},
  read: false,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides
});

// Mock language data
export const mockLanguages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'bg', name: 'Български', flag: '🇧🇬' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ua', name: 'Українська', flag: '🇺🇦' }
];

// Helper to mock SvelteKit stores
export const createMockStore = <T>(initialValue: T) => {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  return {
    subscribe: vi.fn((callback: (value: T) => void) => {
      subscribers.add(callback);
      callback(value);
      return () => subscribers.delete(callback);
    }),
    set: vi.fn((newValue: T) => {
      value = newValue;
      subscribers.forEach(callback => callback(value));
    }),
    update: vi.fn((updater: (value: T) => T) => {
      value = updater(value);
      subscribers.forEach(callback => callback(value));
    })
  };
};

// Helper to mock Supabase client
export const createMockSupabase = () => ({
  auth: {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: null, session: null }, error: null }),
    onAuthStateChange: vi.fn().mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
  },
  from: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null })
  }),
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: null, error: null }),
      download: vi.fn().mockResolvedValue({ data: null, error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'test-url' } })
    })
  }
});

// Helper for testing responsive behavior
export const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
};

// Helper for testing window location changes
export const mockWindowLocation = (overrides?: Partial<Location>) => {
  const mockLocation = {
    href: 'http://localhost:3000/',
    origin: 'http://localhost:3000',
    protocol: 'http:',
    hostname: 'localhost',
    port: '3000',
    pathname: '/',
    search: '',
    hash: '',
    replace: vi.fn(),
    assign: vi.fn(),
    reload: vi.fn(),
    ...overrides
  };

  Object.defineProperty(window, 'location', {
    writable: true,
    value: mockLocation
  });

  return mockLocation;
};

// Helper for testing cookie operations
export const mockDocumentCookie = () => {
  let cookieString = '';
  
  Object.defineProperty(document, 'cookie', {
    get: () => cookieString,
    set: (value: string) => {
      const [nameValue] = value.split(';');
      if (nameValue.includes('=')) {
        const [name, val] = nameValue.split('=');
        // Simple cookie storage for testing
        cookieString = cookieString
          .split('; ')
          .filter(c => !c.startsWith(name + '='))
          .concat(nameValue)
          .join('; ');
      }
    }
  });

  return {
    getCookie: (name: string) => {
      const match = cookieString.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? match[2] : null;
    },
    setCookie: (name: string, value: string) => {
      document.cookie = `${name}=${value}`;
    }
  };
};

// Helper for testing local/session storage
export const mockStorage = () => {
  const storage = new Map<string, string>();
  
  const mockStorageObject = {
    getItem: vi.fn((key: string) => storage.get(key) || null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key);
    }),
    clear: vi.fn(() => {
      storage.clear();
    }),
    length: 0,
    key: vi.fn()
  };

  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: mockStorageObject
  });

  Object.defineProperty(window, 'sessionStorage', {
    writable: true,
    value: mockStorageObject
  });

  return mockStorageObject;
};