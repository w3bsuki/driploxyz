# PHASE 5 PROMPT: Component Documentation & Advanced Optimization

**Objective:** Establish comprehensive component documentation infrastructure, implement advanced performance optimizations, and prepare the design system for scale with Storybook integration and automated testing.

**Context:** 
- Phase 1: ✅ Foundation (Tailwind v4 + Lightning CSS)
- Phase 2: ✅ Token Migration (65+ files, semantic tokens)
- Phase 3: ✅ Component Patterns (@utility directives, best practices)
- Phase 4: ✅ Advanced Optimization (ClassValue, accessibility, reduced motion)
- **Phase 5: Component Documentation & Scale Preparation**

**Prerequisites:**
- Phase 4 completion: ✅ Verified with 0 errors, 0 warnings
- TypeScript strict mode enabled
- Tailwind CSS v4 with Lightning CSS
- Svelte 5.16+ with runes and class={{}} syntax

---

## Phase 5 Objectives

### 1. Storybook Integration & Component Documentation (Priority: HIGH)
**Estimated Time:** 2-3 hours  
**Impact:** Developer experience, design system adoption, visual regression testing

#### Tasks:

##### 1.1 Storybook Setup
**Status:** 🔨 TO DO

**Steps:**
1. Install Storybook for SvelteKit
   ```bash
   cd packages/ui
   npx storybook@latest init --type sveltekit
   ```

2. Configure Storybook for Tailwind v4
   - Add `.storybook/preview.ts` with global styles import
   - Configure Lightning CSS in `.storybook/main.ts`
   - Import design tokens in preview

3. Setup addon ecosystem
   ```bash
   pnpm add -D @storybook/addon-a11y @storybook/addon-themes @storybook/addon-viewport
   ```

**Configuration Example:**
```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],
  addons: [
    '@storybook/addon-svelte-csf',
    '@storybook/addon-essentials',
    '@storybook/addon-a11y',
    '@storybook/addon-themes',
    '@storybook/addon-viewport',
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/sveltekit',
    options: {}
  }
};
export default config;
```

```typescript
// .storybook/preview.ts
import type { Preview } from '@storybook/svelte';
import '../src/styles/tokens-v4/globals.css';
import '../src/styles/tokens-v4/components.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#0a0a0a' }
      ]
    }
  }
};

export default preview;
```

##### 1.2 Component Stories Creation
**Status:** 🔨 TO DO

**Priority Components (Create stories for):**
1. **Button.svelte** - All variants (primary, secondary, ghost, luxury, premium)
2. **Card.svelte** - All variants (default, interactive, luxury, premium, elegant)
3. **Input.svelte** - All states (normal, error, success, disabled)
4. **Select.svelte** - With options, states
5. **Accordion.svelte** - Single/multiple expansion modes
6. **Tooltip.svelte** - All positions

**Story Template Example:**
```typescript
// Button.stories.ts
import type { Meta, StoryObj } from '@storybook/svelte';
import Button from './Button.svelte';

const meta = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'luxury', 'premium'],
      description: 'Visual style variant'
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button'
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state'
    },
    loading: {
      control: 'boolean',
      description: 'Loading state with spinner'
    }
  },
  parameters: {
    docs: {
      description: {
        component: 'Button component with multiple variants and sizes. Supports both button and anchor element rendering.'
      }
    }
  }
} satisfies Meta<Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button'
  }
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button'
  }
};

export const Luxury: Story = {
  args: {
    variant: 'luxury',
    children: 'Shop Luxury'
  }
};

export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: 'Processing...'
  }
};

export const AllSizes: Story = {
  render: () => ({
    Component: Button,
    // Render multiple sizes
  })
};
```

##### 1.3 Design Token Documentation
**Status:** 🔨 TO DO

Create interactive Storybook pages for design tokens:

**Stories to Create:**
1. **Colors.stories.mdx** - All color tokens with visual swatches
2. **Typography.stories.mdx** - Font scales, weights, line heights
3. **Spacing.stories.mdx** - Spacing scale with visual examples
4. **Shadows.stories.mdx** - Shadow tokens with cards
5. **Borders.stories.mdx** - Border radius and color tokens

**Example:**
```mdx
{/* Colors.stories.mdx */}
import { Meta, ColorPalette, ColorItem } from '@storybook/blocks';

<Meta title="Design Tokens/Colors" />

# Color System

Our color system is built on semantic tokens that adapt to light/dark themes.

## Brand Colors

<ColorPalette>
  <ColorItem
    title="Primary"
    subtitle="var(--brand-primary-strong)"
    colors={{ Primary: 'oklch(0.52 0.15 240)' }}
  />
  <ColorItem
    title="Gold"
    subtitle="var(--color-gold-500)"
    colors={{ Gold: 'oklch(0.75 0.08 85)' }}
  />
  <ColorItem
    title="Burgundy"
    subtitle="var(--color-burgundy-500)"
    colors={{ Burgundy: 'oklch(0.35 0.15 25)' }}
  />
</ColorPalette>

## Usage

```svelte
<div class="bg-[var(--brand-primary-strong)] text-[var(--text-inverse)]">
  Primary brand color
</div>
```
```

---

### 2. Visual Regression Testing (Priority: HIGH)
**Estimated Time:** 1-2 hours  
**Impact:** Quality assurance, prevent visual regressions

#### Tasks:

##### 2.1 Chromatic Integration
**Status:** 🔨 TO DO

1. Setup Chromatic for visual regression testing
   ```bash
   pnpm add -D chromatic
   ```

2. Configure GitHub Actions for automated visual tests
   ```yaml
   # .github/workflows/chromatic.yml
   name: Chromatic
   on:
     push:
       branches: [main, develop]
     pull_request:
       branches: [main, develop]
   
   jobs:
     chromatic:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0
         - uses: pnpm/action-setup@v2
           with:
             version: 8
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'pnpm'
         - run: pnpm install
         - run: pnpm --filter @repo/ui run build-storybook
         - uses: chromaui/action@latest
           with:
             projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
             buildScriptName: build-storybook
             workingDir: packages/ui
   ```

3. Setup baseline snapshots for all components

##### 2.2 Playwright Component Testing (Optional)
**Status:** ⚠️ OPTIONAL

For more granular component interaction testing:
```bash
pnpm add -D @playwright/test @playwright/experimental-ct-svelte
```

---

### 3. Performance Monitoring & Optimization (Priority: HIGH)
**Estimated Time:** 2 hours  
**Impact:** User experience, Core Web Vitals, production performance

#### Tasks:

##### 3.1 Lighthouse CI Integration
**Status:** 🔨 TO DO

1. Setup Lighthouse CI for automated performance testing
   ```bash
   pnpm add -D @lhci/cli
   ```

2. Configure Lighthouse CI
   ```javascript
   // lighthouserc.js
   module.exports = {
     ci: {
       collect: {
         startServerCommand: 'pnpm --filter web run preview',
         url: [
           'http://localhost:4173/',
           'http://localhost:4173/product/1',
           'http://localhost:4173/search'
         ],
         numberOfRuns: 3
       },
       assert: {
         preset: 'lighthouse:recommended',
         assertions: {
           'categories:performance': ['error', { minScore: 0.9 }],
           'categories:accessibility': ['error', { minScore: 0.95 }],
           'categories:best-practices': ['error', { minScore: 0.9 }],
           'categories:seo': ['error', { minScore: 0.9 }]
         }
       },
       upload: {
         target: 'temporary-public-storage'
       }
     }
   };
   ```

3. Add to GitHub Actions
   ```yaml
   # .github/workflows/lighthouse.yml
   name: Lighthouse CI
   on:
     pull_request:
       branches: [main]
   
   jobs:
     lighthouse:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: pnpm/action-setup@v2
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'pnpm'
         - run: pnpm install
         - run: pnpm --filter web run build
         - run: pnpm dlx @lhci/cli@latest autorun
   ```

##### 3.2 Bundle Size Tracking
**Status:** 🔨 TO DO

1. Install bundle analyzer
   ```bash
   pnpm add -D rollup-plugin-visualizer
   ```

2. Configure Vite for bundle analysis
   ```typescript
   // apps/web/vite.config.ts
   import { visualizer } from 'rollup-plugin-visualizer';
   
   export default defineConfig({
     plugins: [
       sveltekit(),
       process.env.ANALYZE && visualizer({
         filename: '.svelte-kit/stats.html',
         open: true,
         gzipSize: true,
         brotliSize: true
       })
     ]
   });
   ```

3. Add npm script
   ```json
   {
     "scripts": {
       "analyze": "ANALYZE=true pnpm run build"
     }
   }
   ```

4. Setup bundle size bot for PRs
   ```bash
   pnpm add -D @bundle-stats/cli
   ```

##### 3.3 Core Web Vitals Monitoring
**Status:** 🔨 TO DO

1. Add Web Vitals monitoring
   ```bash
   pnpm add web-vitals
   ```

2. Implement in app layout
   ```typescript
   // apps/web/src/routes/+layout.svelte
   <script lang="ts">
     import { onCLS, onFID, onLCP, onFCP, onTTFB } from 'web-vitals';
     import { browser } from '$app/environment';
     
     if (browser) {
       onCLS(console.log);
       onFID(console.log);
       onLCP(console.log);
       onFCP(console.log);
       onTTFB(console.log);
     }
   </script>
   ```

---

### 4. Advanced Code Splitting & Lazy Loading (Priority: MEDIUM)
**Estimated Time:** 1-2 hours  
**Impact:** Initial load time, bundle size optimization

#### Tasks:

##### 4.1 Component Lazy Loading
**Status:** 🔨 TO DO

Identify heavy components for lazy loading:

1. **ProductCard** in search/category pages
2. **ImageUploader** in sell flow
3. **ReviewModal** on product pages
4. **NotificationPanel** in header
5. **PaymentForm** in checkout

**Implementation Pattern:**
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  
  let NotificationPanel: any;
  let showPanel = $state(false);
  
  async function loadNotifications() {
    if (!NotificationPanel) {
      const module = await import('@repo/ui');
      NotificationPanel = module.NotificationPanel;
    }
    showPanel = true;
  }
</script>

<button onclick={loadNotifications}>
  Show Notifications
</button>

{#if showPanel && NotificationPanel}
  <NotificationPanel />
{/if}
```

##### 4.2 Route-Based Code Splitting
**Status:** ✅ ALREADY IMPLEMENTED (Verify)

SvelteKit automatically code-splits by route. Verify optimal chunking:

```bash
pnpm --filter web run build
# Check output for chunk sizes
```

**Target:** No single chunk over 500 KB after gzip

##### 4.3 Vendor Chunk Optimization
**Status:** 🔨 TO DO

Optimize vendor chunk splitting in Vite config:

```typescript
// apps/web/vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-ui': ['@repo/ui'],
          'vendor-i18n': ['@inlang/paraglide-js-adapter-sveltekit']
        }
      }
    }
  }
});
```

---

### 5. Component Composition Patterns (Priority: MEDIUM)
**Estimated Time:** 1 hour  
**Impact:** Developer experience, maintainability

#### Tasks:

##### 5.1 Compound Components Documentation
**Status:** 🔨 TO DO

Create examples of compound component patterns:

**Example: Accordion as Compound Component**
```svelte
<!-- AccordionRoot.svelte -->
<script lang="ts" context="module">
  import { setContext } from 'svelte';
  const ACCORDION_KEY = Symbol('accordion');
</script>

<script lang="ts">
  let { multiple = false, children } = $props();
  let expandedItems = $state<string[]>([]);
  
  const context = {
    expandedItems,
    multiple,
    toggle: (id: string) => {
      if (multiple) {
        expandedItems = expandedItems.includes(id)
          ? expandedItems.filter(i => i !== id)
          : [...expandedItems, id];
      } else {
        expandedItems = expandedItems.includes(id) ? [] : [id];
      }
    }
  };
  
  setContext(ACCORDION_KEY, context);
</script>

<div class="accordion">
  {@render children?.()}
</div>
```

Usage:
```svelte
<AccordionRoot multiple={true}>
  <AccordionItem id="1" title="Item 1">Content 1</AccordionItem>
  <AccordionItem id="2" title="Item 2">Content 2</AccordionItem>
</AccordionRoot>
```

##### 5.2 Render Props Pattern Documentation
**Status:** 🔨 TO DO

Document Svelte 5 snippet-based render props:

```svelte
<!-- DataTable.svelte -->
<script lang="ts" generics="T">
  import type { Snippet } from 'svelte';
  
  interface Props<T> {
    data: T[];
    header?: Snippet;
    row?: Snippet<[T]>;
    empty?: Snippet;
  }
  
  let { data, header, row, empty }: Props<T> = $props();
</script>

<table>
  {#if header}
    <thead>{@render header()}</thead>
  {/if}
  <tbody>
    {#if data.length === 0}
      {@render empty?.()}
    {:else}
      {#each data as item}
        <tr>{@render row?.(item)}</tr>
      {/each}
    {/if}
  </tbody>
</table>
```

---

### 6. Design Token Reference Documentation (Priority: MEDIUM)
**Estimated Time:** 1-2 hours  
**Impact:** Designer/developer collaboration, design system adoption

#### Tasks:

##### 6.1 Generate Token Documentation
**Status:** 🔨 TO DO

Create comprehensive design token reference:

```markdown
# DESIGN_TOKENS_REFERENCE.md

## Color Tokens

### Brand Colors
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `--brand-primary-strong` | `oklch(0.52 0.15 240)` | `oklch(0.62 0.12 240)` | Primary actions, links |
| `--color-gold-500` | `oklch(0.75 0.08 85)` | `oklch(0.75 0.08 85)` | Luxury variant |
| `--color-burgundy-500` | `oklch(0.35 0.15 25)` | `oklch(0.45 0.12 25)` | Premium variant |

### Semantic Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | Adapts to theme | Primary text content |
| `--text-secondary` | Adapts to theme | Secondary text, labels |
| `--surface-base` | Adapts to theme | Card backgrounds |
| `--border-subtle` | Adapts to theme | Dividers, borders |

## Typography Tokens

### Font Sizes
| Token | Value | Line Height | Usage |
|-------|-------|-------------|-------|
| `--text-xs` | `12px` | `1.25` | Small labels, captions |
| `--text-sm` | `14px` | `1.5` | Body text (small) |
| `--text-base` | `16px` | `1.5` | Body text (default) |
| `--text-lg` | `18px` | `1.5` | Large body text |
| `--text-xl` | `20px` | `1.4` | Small headings |

### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | `400` | Body text |
| `--font-medium` | `500` | Emphasized text |
| `--font-semibold` | `600` | Buttons, labels |
| `--font-bold` | `700` | Headings, prices |

## Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `4px` | Minimal spacing |
| `--space-2` | `8px` | Compact spacing |
| `--space-3` | `12px` | Standard spacing |
| `--space-4` | `16px` | Comfortable spacing |
| `--space-6` | `24px` | Large spacing |
| `--space-8` | `32px` | Extra large spacing |

## Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px` | Subtle elevation |
| `--shadow-md` | `0 4px 6px` | Card elevation |
| `--shadow-lg` | `0 10px 15px` | Modal, dropdown |
| `--shadow-xl` | `0 20px 25px` | Premium cards |

## Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `4px` | Buttons, inputs |
| `--radius-md` | `6px` | Small cards |
| `--radius-lg` | `8px` | Cards, modals |
| `--radius-xl` | `12px` | Large cards |
| `--radius-full` | `9999px` | Pills, badges |

## Component-Specific Tokens

### Button
| Token | Value | Usage |
|-------|-------|-------|
| `--btn-height-lg` | `44px` | Primary buttons |
| `--btn-padding-md` | `16px` | Standard padding |
| `--btn-radius` | `4px` | Button corners |

### Card
| Token | Value | Usage |
|-------|-------|-------|
| `--card-padding-md` | `16px` | Standard card padding |
| `--card-radius` | `4px` | Card corners |
| `--card-shadow` | `var(--shadow-sm)` | Card elevation |

## Usage Examples

```svelte
<!-- Using color tokens -->
<div class="bg-[var(--surface-base)] text-[var(--text-primary)]">
  Content
</div>

<!-- Using spacing tokens -->
<div class="p-[var(--space-4)] gap-[var(--space-2)]">
  Spaced content
</div>

<!-- Using typography tokens -->
<p class="text-[var(--text-base)] font-[var(--font-medium)]">
  Body text
</p>
```
```

##### 6.2 Figma Integration (Optional)
**Status:** ⚠️ OPTIONAL

Export design tokens to Figma format:
```bash
pnpm add -D style-dictionary
```

Configure token export for Figma plugins.

---

### 7. Accessibility Audit & Enhancement (Priority: MEDIUM)
**Estimated Time:** 1 hour  
**Impact:** WCAG compliance, inclusive design

#### Tasks:

##### 7.1 Automated Accessibility Testing
**Status:** 🔨 TO DO

1. Add axe-core to Storybook
   ```typescript
   // Already included via @storybook/addon-a11y
   ```

2. Run accessibility audit on all components
   ```bash
   pnpm --filter @repo/ui run storybook
   # Check A11y addon panel for violations
   ```

3. Document and fix all violations

##### 7.2 Keyboard Navigation Testing
**Status:** 🔨 TO DO

**Components to Test:**
1. Button - Tab, Enter, Space
2. Select - Tab, Arrow keys, Enter, Escape
3. Accordion - Tab, Enter, Space, Arrow keys
4. Modal/Dialog - Tab trap, Escape to close
5. Tooltip - Focus trigger, Escape to dismiss

**Checklist:**
- [ ] All interactive elements are keyboard accessible
- [ ] Focus order is logical
- [ ] Focus is trapped in modals
- [ ] Escape key closes dialogs/tooltips
- [ ] No keyboard traps

##### 7.3 Screen Reader Testing
**Status:** 🔨 TO DO

Test with screen readers:
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

**Focus Areas:**
- Form labels and descriptions
- Button and link labels
- Error messages
- Loading states
- Dynamic content announcements

---

## Success Criteria

### Quantitative Metrics:
- [ ] Storybook running with 20+ component stories
- [ ] Lighthouse Performance score: ≥ 90
- [ ] Lighthouse Accessibility score: ≥ 95
- [ ] Lighthouse Best Practices score: ≥ 90
- [ ] Lighthouse SEO score: ≥ 90
- [ ] Main bundle size: ≤ 350 KB gzipped (improved from 329 KB)
- [ ] No Chromatic visual regressions
- [ ] 0 accessibility violations in Storybook

### Qualitative Metrics:
- [ ] All primitive components have Storybook stories
- [ ] Design token documentation is comprehensive
- [ ] Visual regression testing is automated
- [ ] Performance monitoring is integrated in CI/CD
- [ ] Component composition patterns are documented
- [ ] Accessibility audit completed with remediation plan

---

## Deliverables

### Code:
1. ✅ `.storybook/` - Storybook configuration
2. ✅ Component `.stories.ts` files for all primitives
3. ✅ `.mdx` files for design token documentation
4. ✅ `lighthouserc.js` - Lighthouse CI config
5. ✅ GitHub Actions workflows (Chromatic, Lighthouse)
6. ✅ Bundle analyzer configuration
7. ✅ Lazy loading implementations for heavy components

### Documentation:
1. ✅ `DESIGN_TOKENS_REFERENCE.md` - Complete token reference
2. ✅ `COMPONENT_COMPOSITION_PATTERNS.md` - Pattern documentation
3. ✅ `PHASE_5_COMPLETION_REPORT.md` - Detailed change log
4. ✅ Updated `README.md` with Storybook instructions

### Infrastructure:
1. ✅ Storybook deployed to Chromatic
2. ✅ Lighthouse CI running on PRs
3. ✅ Bundle size bot commenting on PRs
4. ✅ Visual regression baseline established

---

## Execution Strategy

### Recommended Order:

1. **Storybook Setup** (1 hour)
   - Install and configure Storybook
   - Setup addons (a11y, themes, viewport)
   - Create initial configuration

2. **Component Stories** (1.5 hours)
   - Create stories for Button, Card, Input (high priority)
   - Add all variants and states
   - Include interaction examples

3. **Design Token Documentation** (1 hour)
   - Create visual token reference in Storybook
   - Generate DESIGN_TOKENS_REFERENCE.md
   - Add usage examples

4. **Visual Regression Testing** (45 minutes)
   - Setup Chromatic
   - Create baseline snapshots
   - Configure GitHub Actions

5. **Performance Monitoring** (1 hour)
   - Setup Lighthouse CI
   - Configure bundle analyzer
   - Add Web Vitals monitoring

6. **Code Splitting Optimization** (1 hour)
   - Identify heavy components for lazy loading
   - Implement dynamic imports
   - Optimize vendor chunks

7. **Accessibility Audit** (45 minutes)
   - Run automated tests in Storybook
   - Manual keyboard navigation testing
   - Document and fix violations

8. **Documentation** (30 minutes)
   - Create component composition examples
   - Update README with new tooling
   - Write Phase 5 completion report

---

## Estimated Total Time: 6-8 hours

**Breakdown:**
- Storybook setup and stories: 2.5 hours
- Design token documentation: 1 hour
- Visual regression testing: 45 minutes
- Performance monitoring: 1 hour
- Code splitting: 1 hour
- Accessibility audit: 45 minutes
- Documentation: 30 minutes
- Buffer: 1 hour

---

## Post-Phase 5 Roadmap

### Phase 6 (Future):
1. Mobile app component parity (React Native)
2. Cross-platform design token system (Tamagui/NativeWind)
3. Advanced theming (multi-brand support)
4. Real-time performance monitoring in production
5. Component versioning and changelog
6. Design system governance and contribution guidelines

### Phase 7 (Future):
1. Advanced animation system with Framer Motion
2. Form validation library integration
3. Data visualization components
4. Advanced table/grid components
5. Drag-and-drop functionality
6. Internationalization (i18n) for components

---

## Notes for Implementation

### Storybook Best Practices
- Use CSF3 (Component Story Format 3)
- Leverage `autodocs` for automatic documentation
- Use controls for interactive prop editing
- Add accessibility tests to all stories
- Include usage examples in MDX

### Performance Targets
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Time to Interactive (TTI): < 3.5s

### Bundle Size Targets
- Main chunk: < 350 KB gzipped
- Vendor chunks: < 100 KB each gzipped
- CSS: < 45 KB gzipped
- Individual components: < 10 KB gzipped

---

## Verification Commands

```bash
# Run all checks
pnpm --filter web run check
pnpm --filter web run build

# Start Storybook
pnpm --filter @repo/ui run storybook

# Build Storybook
pnpm --filter @repo/ui run build-storybook

# Run Lighthouse CI
pnpm dlx @lhci/cli@latest autorun

# Analyze bundle
pnpm --filter web run analyze

# Run Chromatic
pnpm dlx chromatic --project-token=<token>
```

---

**Execute this prompt to establish comprehensive component documentation, implement visual regression testing, and prepare the design system for production scale with advanced performance monitoring.**

**Expected Result:** Complete Storybook documentation, automated testing infrastructure, performance monitoring, and optimized bundle sizes for production deployment.
