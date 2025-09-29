import type { PlaywrightTestConfig } from '@playwright/test';

const shouldStartWebServer = !process.env.PLAYWRIGHT_SKIP_WEB_SERVER;

const config: PlaywrightTestConfig = {
  webServer: shouldStartWebServer
    ? {
        command: 'pnpm --filter web dev',
        port: 5173,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000
      }
    : undefined,
  testDir: 'tests',
  testMatch: /.+\.pw\.[jt]s/
};

export default config;
