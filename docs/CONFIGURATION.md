# CONFIGURATION - SvelteKit & Vite Setup

**Reference**: https://svelte.dev/docs/kit/configuration

## SVELTE.CONFIG.JS

### 1. Complete Configuration
```javascript
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Preprocessing
  preprocess: vitePreprocess(),
  
  // Compiler Options
  compilerOptions: {
    runes: true, // Svelte 5 runes
    css: 'injected' // CSS handling
  },
  
  // SvelteKit Options
  kit: {
    // Adapter
    adapter: adapter({
      runtime: 'nodejs20.x',
      maxDuration: 30,
      memory: 1024,
      regions: ['iad1']
    }),
    
    // Aliases
    alias: {
      $components: 'src/lib/components',
      $utils: 'src/lib/utils',
      $stores: 'src/lib/stores'
    },
    
    // CSRF Protection
    csrf: {
      checkOrigin: true,
      origins: [
        'https://driplo.xyz',
        'https://www.driplo.xyz'
      ]
    },
    
    // Environment
    env: {
      dir: process.cwd(),
      publicPrefix: 'PUBLIC_'
    },
    
    // Files
    files: {
      assets: 'static',
      hooks: {
        client: 'src/hooks.client',
        server: 'src/hooks.server'
      },
      lib: 'src/lib',
      params: 'src/params',
      routes: 'src/routes',
      serviceWorker: 'src/service-worker',
      appTemplate: 'src/app.html',
      errorTemplate: 'src/error.html'
    },
    
    // Inline Styles Threshold
    inlineStyleThreshold: 0,
    
    // Output Directory
    outDir: '.svelte-kit',
    
    // Paths
    paths: {
      assets: '',
      base: '',
      relative: true
    },
    
    // Prerendering
    prerender: {
      concurrency: 1,
      crawl: true,
      enabled: true,
      entries: ['*'],
      handleHttpError: 'warn',
      handleMissingId: 'warn',
      handleEntryGeneratorMismatch: 'warn',
      origin: 'http://sveltekit-prerender'
    },
    
    // Service Worker
    serviceWorker: {
      register: true,
      files: (filepath) => !/\.DS_Store/.test(filepath)
    },
    
    // Typescript
    typescript: {
      config: (config) => ({
        ...config,
        compilerOptions: {
          ...config.compilerOptions,
          preserveValueImports: false
        }
      })
    },
    
    // Version
    version: {
      name: Date.now().toString(),
      pollInterval: 0
    }
  }
};

export default config;
```

## VITE.CONFIG.JS

### 1. Optimized Configuration
```javascript
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  
  // Server Options
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    fs: {
      allow: ['..']
    }
  },
  
  // Preview Options
  preview: {
    port: 4173,
    strictPort: false
  },
  
  // Build Options
  build: {
    target: 'es2020',
    minify: 'terser',
    sourcemap: false,
    
    // Terser Options
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    
    // Rollup Options
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': [
            'svelte',
            '@sveltejs/kit'
          ],
          'supabase': [
            '@supabase/supabase-js',
            '@supabase/ssr'
          ]
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        entryFileNames: 'entries/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    },
    
    // Chunk Size Warning
    chunkSizeWarningLimit: 500
  },
  
  // Optimizations
  optimizeDeps: {
    include: [
      'svelte',
      '@sveltejs/kit'
    ],
    exclude: [
      '@sveltejs/kit/node'
    ]
  },
  
  // Define Global Constants
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version)
  },
  
  // CSS Options
  css: {
    devSourcemap: true
  },
  
  // Resolve
  resolve: {
    dedupe: ['svelte'],
    alias: {
      $lib: '/src/lib',
      $routes: '/src/routes'
    }
  }
});
```

## TSCONFIG.JSON

### 1. TypeScript Configuration
```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "moduleResolution": "bundler",
    "types": ["vite/client"],
    "paths": {
      "$lib": ["./src/lib"],
      "$lib/*": ["./src/lib/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.js",
    "src/**/*.svelte"
  ],
  "exclude": [
    "node_modules",
    ".svelte-kit",
    "dist"
  ]
}
```

## POSTCSS.CONFIG.JS

### 1. PostCSS with TailwindCSS
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: 'default'
      }
    } : {})
  }
};
```

## TAILWIND.CONFIG.JS

### 1. TailwindCSS v3 Configuration
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@repo/ui/**/*.{svelte,ts}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#10b981'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
```

## PACKAGE.JSON SCRIPTS

```json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "preview": "vite preview",
    "check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
    "check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
    "test": "vitest",
    "lint": "eslint .",
    "format": "prettier --write .",
    "prepare": "svelte-kit sync"
  }
}
```

## VERCEL.JSON

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".vercel/output",
  "framework": "sveltekit",
  "regions": ["iad1"],
  "functions": {
    "src/routes/**/+*.ts": {
      "maxDuration": 30
    }
  }
}
```

## OPTIMIZATION CHECKLIST

- [ ] Runes enabled for Svelte 5
- [ ] Adapter configured for platform
- [ ] CSRF protection enabled
- [ ] Prerendering configured
- [ ] Build optimizations enabled
- [ ] Code splitting configured
- [ ] TypeScript strict mode
- [ ] CSS optimizations
- [ ] Environment variables set
- [ ] Aliases configured