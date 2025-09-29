import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'pnpm --filter web dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000
  },
  testDir: 'tests',
  testMatch: /.+\.pw\.[jt]s/
});
