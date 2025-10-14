module.exports = {
  ci: {
    collect: {
      startServerCommand: 'pnpm --filter web build && pnpm --filter web preview',
      url: ['http://localhost:4173/'],
      numberOfRuns: 1,
      startServerReadyPattern: 'Local',
      settings: {
        preset: 'desktop'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.85 }]
      }
    },
    upload: { target: 'temporary-public-storage' }
  }
};
