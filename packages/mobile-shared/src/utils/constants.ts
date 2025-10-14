// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    SIGN_IN: '/auth/sign-in',
    SIGN_UP: '/auth/sign-up',
    SIGN_OUT: '/auth/sign-out',
    REFRESH: '/auth/refresh',
  },
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products/:id',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
  },
  MESSAGES: {
    LIST: '/messages',
    SEND: '/messages',
    MARK_READ: '/messages/:id/read',
  },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  LAST_ACTIVE: 'last_active',
} as const;

// Image Upload Constants
export const IMAGE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES: 10,
  QUALITY: 0.8,
  FORMATS: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

// Product Validation Constants
export const PRODUCT_VALIDATION = {
  TITLE: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  DESCRIPTION: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 2000,
  },
  PRICE: {
    MIN: 0,
    MAX: 999999,
  },
} as const;

// Message Constants
export const MESSAGE_CONSTANTS = {
  MAX_LENGTH: 1000,
  READ_DELAY: 500, // ms
  TYPING_TIMEOUT: 3000, // ms
} as const;

// Pagination Constants
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Animation Constants
export const ANIMATION = {
  DURATION: {
    SHORT: 200,
    MEDIUM: 300,
    LONG: 500,
  },
  EASING: {
    EASE_IN: 'easeIn',
    EASE_OUT: 'easeOut',
    EASE_IN_OUT: 'easeInOut',
  },
} as const;

// Color Constants
export const COLORS = {
  PRIMARY: '#6366f1',
  SECONDARY: '#8b5cf6',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#3b82f6',
  NEUTRAL: '#6b7280',
} as const;

// Screen Breakpoints
export const BREAKPOINTS = {
  SM: 375,
  MD: 768,
  LG: 1024,
  XL: 1280,
} as const;
