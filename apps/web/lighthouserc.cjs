module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm --filter web build && pnpm --filter web preview',
      url: [
        'http://localhost:4173/',
        'http://localhost:4173/search',
        'http://localhost:4173/login'
      ],
      numberOfRuns: 3,
      startServerReadyPattern: 'Local',
      settings: {
        preset: 'desktop',
        // Custom throttling for realistic conditions
        throttling: {
          cpuSlowdownMultiplier: 2
        },
        // Emulate form factor
        formFactor: 'desktop',
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1
        }
      }
    },
    assert: {
      assertions: {
        // Core Web Vitals assertions
        'categories:performance': ['error', { minScore: 0.7, aggregationMethod: 'median-run' }],
        'categories:accessibility': ['error', { minScore: 0.9, aggregationMethod: 'pessimistic' }],
        'categories:best-practices': ['warn', { minScore: 0.85, aggregationMethod: 'pessimistic' }],
        'categories:seo': ['warn', { minScore: 0.85, aggregationMethod: 'pessimistic' }],
        
        // Core Web Vitals specific
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'speed-index': ['warn', { maxNumericValue: 3400 }],
        
        // Resource optimization
        'uses-responsive-images': 'off', // May have false positives
        'uses-optimized-images': 'warn',
        'uses-text-compression': 'warn',
        'render-blocking-resources': 'warn'
      }
    },
    upload: { 
      target: 'temporary-public-storage',
      // Optionally upload to LHCI server
      // serverBaseUrl: process.env.LHCI_SERVER_URL,
      // token: process.env.LHCI_SERVER_TOKEN
    }
  }
};
