# Development Guide

Complete workflow guide for contributing to Driplo.

---

## Environment Setup

### Prerequisites

1. **Node.js 22.12.x** (enforced)
   ```bash
   # Install nvm (if not installed)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Use project Node version
   nvm use
   # or
   nvm install 22.12.0 && nvm use 22.12.0
   ```

2. **pnpm 8.15.6+**
   ```bash
   npm install -g pnpm
   ```

3. **Supabase CLI** (optional, for local database)
   ```bash
   brew install supabase/tap/supabase
   # or
   npm install -g supabase
   ```

4. **Accounts**
   - Supabase account (database & auth)
   - Stripe account (payments)
   - Vercel account (deployment)

---

## Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/driplo-turbo.git
cd driplo-turbo

# Use correct Node version
nvm use

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your credentials

# Optional: Start local Supabase
supabase start

# Optional: Run migrations
pnpm supabase db push

# Generate database types
pnpm --filter @repo/database db:types

# Start development server
pnpm dev --filter web
```

Visit [http://localhost:5173](http://localhost:5173)

---

## Development Commands

### Workspace-Wide Commands

Run tasks across all packages:

```bash
# Lint all packages
pnpm -w turbo run lint

# Type check all packages
pnpm -w turbo run check-types

# Test all packages
pnpm -w turbo run test

# Build all packages
pnpm -w turbo run build

# Development servers (all apps)
pnpm -w turbo run dev
```

### Single Package Commands

Target specific workspace:

```bash
# Web app
pnpm dev --filter web               # Start dev server
pnpm --filter web lint              # Lint
pnpm --filter web check-types       # Type check
pnpm --filter web test              # Unit tests
pnpm --filter web test:watch        # Watch mode
pnpm --filter web test:e2e          # E2E tests
pnpm --filter web build             # Production build

# UI package
pnpm --filter @repo/ui lint
pnpm --filter @repo/ui test
pnpm --filter @repo/ui build

# Core package
pnpm --filter @repo/core lint
pnpm --filter @repo/core test
pnpm --filter @repo/core build

# Database types
pnpm --filter @repo/database db:types
```

---

## Turborepo Pipeline

Turborepo orchestrates tasks across workspaces with intelligent caching and parallelization.

### Core Tasks

#### `dev` - Development Server
- Starts local dev servers with hot reload
- Cache disabled (continuous file watching)
- Runs until manually stopped
- **Usage:** `pnpm dev --filter web`

#### `build` - Production Build
- Compiles and bundles for production
- Depends on upstream package builds
- Outputs to `.svelte-kit/`, `dist/`, `lib/`
- **Usage:** `pnpm -w turbo run build`

#### `lint` - Code Quality
- Runs ESLint across all workspaces
- Enforces coding standards
- Fast execution with caching
- **Usage:** `pnpm -w turbo run lint`

#### `check-types` - TypeScript Validation
- Static type checking (no emit)
- Validates types across package boundaries
- **Usage:** `pnpm -w turbo run check-types`

#### `test` - Test Suite
- Runs unit tests (Vitest) and E2E (Playwright)
- Depends on build completion
- Generates coverage reports
- **Usage:** `pnpm -w turbo run test`

### Performance Baselines

Captured on development machine (for regression detection):

- **lint:** ~15 seconds
- **check-types:** ~21 seconds
- **test:** ~5 seconds
- **build:** ~38 seconds

---

## Workflow

### Daily Development

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies (if package.json changed)
pnpm install

# 3. Start development server
pnpm dev --filter web

# 4. Make changes
# Edit files in apps/web/src/

# 5. Run tests in watch mode (separate terminal)
pnpm --filter web test:watch

# 6. Check types
pnpm --filter web check-types

# 7. Lint
pnpm --filter web lint
```

### Before Committing

**Quality gates (all must pass):**

```bash
# Run full pipeline
pnpm -w turbo run lint check-types test build

# If any fail, fix issues before committing
```

**Auto-format:**

```bash
pnpm format
```

---

## Git Workflow

### Branch Naming

- **Features:** `feature/user-authentication`, `feature/product-search`
- **Fixes:** `fix/checkout-bug`, `fix/type-error`
- **Refactors:** `refactor/extract-service`, `refactor/phase-2`
- **Docs:** `docs/update-readme`, `docs/api-reference`

### Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): message

feat(auth): add OAuth login
fix(checkout): handle stripe timeout
docs(readme): update setup instructions
refactor(services): extract order logic
test(products): add unit tests
chore(deps): upgrade svelte to 5.36
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `refactor` - Code refactor (no behavior change)
- `test` - Adding or updating tests
- `chore` - Tooling, dependencies, config

### Pull Request Process

1. **Create branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make changes**
   - Write code
   - Add tests
   - Update docs if needed

3. **Commit**
   ```bash
   git add .
   git commit -m "feat(products): add advanced search"
   ```

4. **Push**
   ```bash
   git push origin feature/amazing-feature
   ```

5. **Open PR**
   - Fill out PR template
   - Link related issues
   - Request review

6. **Address feedback**
   - Make requested changes
   - Push additional commits

7. **Merge**
   - Squash and merge (default)
   - Delete branch after merge

---

## Code Review Checklist

**Before requesting review:**

- [ ] All tests pass
- [ ] Types check without errors
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Manual testing complete
- [ ] Documentation updated (if needed)
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Commits are clean and logical

**Reviewer checklist:**

- [ ] Code follows conventions (see [ARCHITECTURE.md](./ARCHITECTURE.md))
- [ ] Tests cover new functionality
- [ ] No security vulnerabilities
- [ ] Performance implications considered
- [ ] Error handling is robust
- [ ] Documentation is clear

---

## TypeScript Guidelines

### Explicit Types

```typescript
// ✅ Good - explicit return type
export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ❌ Bad - inferred return type
export function calculateTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

### No `any`

```typescript
// ✅ Good - use unknown and type guard
function handleError(error: unknown): void {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ Bad - any disables type checking
function handleError(error: any) {
  console.error(error.message);
}
```

### Use `satisfies`

```typescript
// ✅ Good - type-safe with inference
export const load = (async ({ locals }) => {
  return { session: locals.session };
}) satisfies PageServerLoad;

// ❌ Bad - no type checking
export async function load({ locals }) {
  return { session: locals.session };
}
```

---

## Debugging

### VS Code Setup

**Recommended extensions:**
- Svelte for VS Code
- ESLint
- Prettier
- Tailwind CSS IntelliSense

**Launch configuration (`.vscode/launch.json`):**
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Web App",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev", "--filter", "web"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Common Issues

**Issue:** `pnpm install` fails with engine mismatch

**Solution:**
```bash
nvm use 22.12.0
pnpm install
```

---

**Issue:** Type errors after pulling changes

**Solution:**
```bash
# Regenerate types
pnpm svelte-kit sync
pnpm --filter @repo/database db:types
```

---

**Issue:** Tests fail with import errors

**Solution:**
```bash
# Rebuild packages
pnpm -w turbo run build
```

---

**Issue:** Stale Turborepo cache

**Solution:**
```bash
# Clear cache
pnpm turbo run build --force
```

---

## Adding New Dependencies

### Workspace Dependency

```bash
# Add to specific package
pnpm --filter web add stripe
pnpm --filter @repo/core add zod

# Add dev dependency
pnpm --filter web add -D vitest

# Add to workspace root
pnpm add -w -D prettier
```

### Updating Dependencies

```bash
# Update specific package
pnpm --filter web update stripe

# Update all packages
pnpm -w update
```

---

## Database Development

### Running Migrations

```bash
# Start local Supabase
supabase start

# Create migration
supabase migration new add_products_table

# Edit migration file in supabase/migrations/

# Apply migration
supabase db push

# Generate types
pnpm --filter @repo/database db:types
```

### Seeding Data

```bash
# Edit supabase/seed.sql

# Apply seed
supabase db reset
```

See [SUPABASE.md](./SUPABASE.md) for detailed database workflows.

---

## Testing Workflow

### Unit Tests (Vitest)

```bash
# Run tests
pnpm --filter web test

# Watch mode
pnpm --filter web test:watch

# Coverage
pnpm --filter web test:coverage

# Specific file
pnpm --filter web test ProductCard.test.ts
```

### E2E Tests (Playwright)

```bash
# Install browsers (first time)
pnpm --filter web exec playwright install

# Run E2E tests
pnpm --filter web test:e2e

# Debug mode
pnpm --filter web test:e2e --debug

# Specific test
pnpm --filter web test:e2e checkout.spec.ts
```

See [TESTING.md](./TESTING.md) for testing strategy and patterns.

---

## Performance Optimization

### Bundle Analysis

```bash
# Build with stats
pnpm --filter web build

# Check .svelte-kit/output/client for bundle sizes
```

### Lighthouse Audit

```bash
# Build and preview
pnpm --filter web build
pnpm --filter web preview

# Run Lighthouse (Chrome DevTools)
# Target: Score > 90 for all metrics
```

---

## CI/CD

### GitHub Actions

Pipeline runs on every PR:

1. Install dependencies
2. Lint all packages
3. Type check all packages
4. Run tests
5. Build all packages

**All steps must pass before merge.**

### Vercel Deployment

- **Preview:** Every PR gets a preview deployment
- **Production:** Merges to `main` deploy to production

---

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [FRAMEWORKS.md](./FRAMEWORKS.md) - SvelteKit, Svelte, Tailwind guides
- [TESTING.md](./TESTING.md) - Testing strategy
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [SUPABASE.md](./SUPABASE.md) - Database workflows

---

## Post-Refactor Development (2025)

### Project Structure After 7-Phase Refactor

The project has undergone a comprehensive 7-phase refactor to reduce dependencies and optimize performance. The current structure is:

```
packages/
├── core/          # Core business logic, auth, payments, email
├── ui/            # UI component library with Svelte 5 runes
├── i18n/          # Paraglide internationalization
├── domain/        # Domain types and interfaces
├── testing/       # Testing utilities and configurations
└── eslint-config/ # Shared ESLint configurations

apps/
└── web/           # Main SvelteKit application
```

### Key Changes from Refactor

1. **Package Reduction**: Reduced total package count by [REDUCTION]%
2. **Svelte 5 Migration**: Migrated to Svelte 5 with runes ($state, $derived, $effect)
3. **Modern Patterns**: Implemented modern reactivity patterns throughout
4. **Performance Optimizations**: Improved build times and runtime performance
5. ** streamlined Dependencies**: Removed redundant and overlapping packages

### Current Development Workflow

After the refactor, follow this enhanced workflow:

```bash
# 1. Ensure project health after refactor
node final-verification.js

# 2. Start development server
pnpm dev --filter web

# 3. Make changes following Svelte 5 patterns
# Use runes instead of stores where appropriate

# 4. Run quality checks
pnpm -w turbo run lint
pnpm -w turbo run check-types
pnpm -w turbo run test
```

### CLI Agent for Further Optimizations

The project is now set up for CLI agent optimization using MCP servers:

#### Available Optimization Tasks

See [CLI_AGENT_TASKS.md](../CLI_AGENT_TASKS.md) for detailed tasks:

1. **Svelte MCP Tasks**
   - Component pattern verification
   - Reactivity optimization
   - Performance improvements

2. **Supabase MCP Tasks**
   - Query optimization
   - RLS policy improvements
   - Schema optimization

3. **Paraglide i18n Tasks**
   - Message bundle optimization
   - Runtime performance

4. **Tailwind CSS v4 Migration**
   - Preparation for v4 upgrade
   - Bundle optimization

#### Using the CLI Agent

```bash
# Connect to Svelte MCP server
npx -y @sveltejs/mcp

# Verify component
svelte-autofixer --file path/to/component.svelte --version 5

# Connect to Supabase MCP server
npx -y @supabase/mcp-server-supabase@latest --project-ref=koowfhsaqmarfdkwsfiz

# Run security advisors
get_advisors --type security
```

### Svelte 5 Development Guidelines

#### Using Runes

```typescript
// Instead of stores, use runes
const count = $state(0);           // Reactive state
const doubled = $derived(count * 2); // Derived values

// Effects with cleanup
$effect(() => {
  const timer = setInterval(() => count++, 1000);
  return () => clearInterval(timer); // Cleanup
});
```

#### Component Patterns

```svelte
<script lang="ts">
  // Props with types
  interface Props {
    title: string;
    onSubmit?: () => void;
  }

  let { title, onSubmit }: Props = $props();

  // Local state
  const isLoading = $state(false);
  
  // Handle events
  async function handleSubmit() {
    isLoading = true;
    try {
      await onSubmit?.();
    } finally {
      isLoading = false;
    }
  }
</script>

<button onclick={handleSubmit} disabled={isLoading}>
  {title}
</button>
```

### Type Safety Improvements

The refactor improved type safety across the project:

- Better TypeScript coverage ([PERCENTAGE]%)
- Reduced `any` type usage by [PERCENTAGE]%
- Improved type inference
- Stricter type checking enabled

### Performance Monitoring

After the refactor, monitor these metrics:

- Bundle size: Should be reduced by [SIZE_REDUCTION]%
- Build time: Should be faster by [TIME_REDUCTION]%
- Runtime performance: Improved Core Web Vitals
- Development server: Faster hot module replacement

### Troubleshooting Post-Refactor Issues

#### TypeScript Errors

If you encounter TypeScript errors after the refactor:

```bash
# Regenerate types
pnpm svelte-kit sync
pnpm --filter @repo/database db:types

# Clear build cache
pnpm turbo run build --force
```

#### Svelte 5 Migration Issues

For Svelte 5 related issues:

1. Check SVELTE_5_OPTIMIZATION_REPORT.md for known patterns
2. Use the Svelte MCP server for component verification
3. Ensure proper cleanup in effects

#### Build Performance

If build performance is degraded:

1. Check for missing dependencies
2. Verify package.json is correct
3. Run `pnpm install` to refresh dependencies
4. Clear Turborepo cache: `pnpm turbo run build --force`

### Documentation Updates

For more information about the refactor:

- [REFACTOR_SUMMARY.md](../REFACTOR_SUMMARY.md) - Complete refactor overview
- [CLI_AGENT_TASKS.md](../CLI_AGENT_TASKS.md) - Tasks for CLI agent
- [SVELTE_5_OPTIMIZATION_REPORT.md](../SVELTE_5_OPTIMIZATION_REPORT.md) - Svelte 5 migration details

### Future Development Guidelines

When adding new features:

1. Follow Svelte 5 patterns with runes
2. Maintain the reduced package count
3. Use the established component patterns
4. Consider CLI agent optimization opportunities
5. Run the verification script before committing

The project is now in an optimized state ready for continued development with enhanced performance and maintainability.