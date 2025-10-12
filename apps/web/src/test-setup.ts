import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

vi.mock('$app/environment', () => ({
  browser: false,
  dev: true,
  building: false,
  version: '1.0.0'
}));
