import { defineConfig, devices } from '@playwright/test';

/**
 * Performance-focused Playwright configuration
 * Optimized for testing filter component performance
 * Aligns with CLAUDE.md mobile-first requirements
 */
export default defineConfig({
  testDir: './performance-tests',
  
  // Test configuration for performance testing
  fullyParallel: false, // Run performance tests sequentially for consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1, // Single worker for performance consistency
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'performance-test-results' }],
    ['json', { outputFile: 'performance-test-results.json' }],
    ['github'] // GitHub Actions integration
  ],
  
  // Global test settings
  use: {
    // Base URL for testing
    baseURL: 'http://localhost:5173',
    
    // Trace collection for performance analysis
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Performance testing specific settings
    actionTimeout: 10000,
    navigationTimeout: 30000,
    
    // Simulate real user conditions
    launchOptions: {
      // Disable background throttling for consistent results
      args: ['--disable-background-timer-throttling', '--disable-renderer-backgrounding']
    }
  },

  // Projects for different testing scenarios
  projects: [
    {
      name: 'performance-mobile-chrome',
      use: {
        ...devices['iPhone 12'],
        // Override iPhone 12 settings for performance testing
        viewport: { width: 375, height: 667 },
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        
        // Mobile network simulation (3G Fast)
        contextOptions: {
          permissions: ['geolocation'],
          geolocation: { latitude: 42.3601, longitude: -71.0589 }, // Boston
        }
      },
    },
    
    {
      name: 'performance-mobile-low-end',
      use: {
        // Simulate low-end Android device (Moto G4)
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.101 Mobile Safari/537.36',
        
        // CPU throttling for low-end device simulation
        launchOptions: {
          args: [
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--simulate-outdated-no-au-notification',
            '--force-device-scale-factor=2'
          ]
        }
      },
    },
    
    {
      name: 'performance-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },
    
    {
      name: 'performance-memory-testing',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--disable-background-timer-throttling',
            '--js-flags=--expose-gc'
          ]
        }
      },
    }
  ],

  // Web server configuration for testing
  webServer: {
    command: 'npm run dev',
    port: 5173,
    reuseExistingServer: !process.env.CI,
    
    // Wait for server to be ready
    timeout: 120 * 1000,
    
    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      BROWSER: 'none'
    }
  },
  
  // Global setup and teardown
  globalSetup: require.resolve('./performance-tests/global-setup.ts'),
  globalTeardown: require.resolve('./performance-tests/global-teardown.ts'),
  
  // Test timeout configuration
  timeout: 60 * 1000, // 60 seconds for performance tests
  expect: {
    timeout: 10 * 1000 // 10 seconds for assertions
  },
  
  // Metadata for performance tracking
  metadata: {
    testType: 'performance',
    performanceBudgets: {
      filterUpdateTime: 100,      // ms
      modalAnimationTime: 300,    // ms
      bottomSheetTransition: 250, // ms
      memoryHeapIncrease: 2,      // MB
      bundleSize: 50000          // bytes
    }
  }
});