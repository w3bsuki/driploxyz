# Contributing Guide

Welcome! We're excited to have you contribute to Driplo.

---

## Quick Start

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/your-username/driplo-turbo.git`
3. **Setup** environment: See [DEVELOPMENT.md](./DEVELOPMENT.md)
4. **Create branch**: `git checkout -b feature/your-feature`
5. **Make changes** and add tests
6. **Run quality checks**: `pnpm -w turbo run lint check-types test build`
7. **Commit**: `git commit -m "feat: add amazing feature"`
8. **Push**: `git push origin feature/your-feature`
9. **Open Pull Request**

---

## Development Process

### Before You Start

- **Check existing issues** - Someone might already be working on it
- **Discuss major changes** - Open an issue first for big features
- **Read documentation** - Familiarize yourself with the codebase

### Development Workflow

```bash
# 1. Ensure correct Node version
nvm use

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev --filter web

# 4. Make changes in separate terminal
# Edit files in apps/web/src/

# 5. Run tests in watch mode
pnpm --filter web test:watch

# 6. Before committing
pnpm -w turbo run lint check-types test build
```

---

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation only
- `style` - Code style (formatting, no logic change)
- `refactor` - Code refactor (no behavior change)
- `perf` - Performance improvement
- `test` - Adding or updating tests
- `chore` - Tooling, dependencies, config

### Scope (optional)

Package or feature area: `auth`, `checkout`, `ui`, `core`

### Examples

```bash
feat(auth): add OAuth login
fix(checkout): handle stripe timeout error
docs(readme): update setup instructions
refactor(services): extract order logic to @repo/core
test(products): add unit tests for search
chore(deps): upgrade svelte to 5.36
```

---

## Code Style

### TypeScript

- **Explicit return types** on all functions
- **No `any` types** - use `unknown` with type guards
- **Prefer interfaces** over types for objects
- **Use `satisfies`** for SvelteKit load/action exports

### Svelte 5

- **Use runes**: `$state`, `$derived`, `$effect`, `$props`
- **Reassign arrays/objects** (don't mutate)
- **No legacy patterns**: `export let`, `$:` reactive statements

### Naming

- **Components**: PascalCase (`ProductCard.svelte`)
- **Routes**: kebab-case (`/product-detail`)
- **Variables**: camelCase (`userId`, `productData`)
- **Constants**: UPPER_SNAKE_CASE (`PUBLIC_SUPABASE_URL`)

### Imports

```typescript
// ✅ Good - workspace aliases
import { Button } from '@repo/ui';
import { createClient } from '@repo/core/supabase';

// ❌ Bad - relative paths to packages
import { Button } from '../../../packages/ui/src/Button.svelte';
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed conventions.

---

## Testing Requirements

### Coverage Targets

- **@repo/core**: 70%
- **@repo/domain**: 80%
- **@repo/ui**: 50%
- **apps/web**: 40%

### Test Types

```bash
# Unit tests (required for new features)
pnpm --filter web test

# E2E tests (required for critical flows)
pnpm --filter web test:e2e
```

### Writing Tests

- **Test behavior**, not implementation
- **Mock external dependencies** (Supabase, Stripe)
- **Use descriptive names**: `it('creates order with valid payment', ...)`
- **Test edge cases** and error conditions

See [TESTING.md](./TESTING.md) for detailed testing guide.

---

## Pull Request Process

### Before Opening PR

- [ ] All tests pass locally
- [ ] Types check without errors
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Manual testing complete
- [ ] Documentation updated (if needed)
- [ ] No console.log statements
- [ ] No commented-out code

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test these changes

## Screenshots (if applicable)

## Checklist
- [ ] Tests pass
- [ ] Types check
- [ ] Lint passes
- [ ] Documentation updated
```

### Review Process

1. **Automated checks** run (CI)
2. **Code review** by maintainer
3. **Address feedback** if needed
4. **Approve & merge** (squash and merge)

---

## Code Review Guidelines

### As an Author

- **Keep PRs small** (<500 lines when possible)
- **Write clear descriptions** explaining why, not what
- **Respond to feedback** promptly and respectfully
- **Don't take it personally** - reviews improve code quality

### As a Reviewer

- **Be kind and constructive**
- **Ask questions** instead of making demands
- **Suggest improvements** with examples
- **Approve when ready** (perfection not required)

### Review Checklist

- [ ] Code follows conventions
- [ ] Tests cover new functionality
- [ ] No security vulnerabilities
- [ ] Performance implications considered
- [ ] Error handling is robust
- [ ] Documentation is clear

---

## Project Structure

### Adding New Files

**Components:**
```
packages/ui/src/lib/ProductCard.svelte
packages/ui/src/lib/ProductCard.test.ts
```

**Services:**
```
packages/core/src/services/orders.ts
packages/core/src/services/orders.test.ts
```

**Routes:**
```
apps/web/src/routes/products/[id]/+page.svelte
apps/web/src/routes/products/[id]/+page.server.ts
```

### Package Boundaries

- **apps/web** - App-specific UI and routes
- **packages/ui** - Shared components (no business logic)
- **packages/core** - Business logic and services
- **packages/database** - Supabase types

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed structure.

---

## Common Tasks

### Adding a Dependency

```bash
# Add to specific package
pnpm --filter web add stripe
pnpm --filter @repo/core add zod

# Dev dependency
pnpm --filter web add -D vitest
```

### Creating a Component

```svelte
<!-- packages/ui/src/lib/MyComponent.svelte -->
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
  }

  let { title, count = 0 }: Props = $props();
</script>

<div>
  <h2>{title}</h2>
  <p>Count: {count}</p>
</div>
```

### Adding a Service

```typescript
// packages/core/src/services/myservice.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@repo/database';

export async function fetchData(
  supabase: SupabaseClient<Database>
): Promise<{ success: boolean; data?: any; error?: string }> {
  const { data, error } = await supabase.from('table').select('*');

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data };
}
```

---

## Getting Help

### Resources

- **Documentation**: Start with [README.md](./README.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/driplo-turbo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/driplo-turbo/discussions)

### Asking Questions

Good question format:

```markdown
**What I'm trying to do:**
Add user authentication with Supabase

**What I've tried:**
- Read SUPABASE.md
- Attempted to implement in +layout.server.ts

**Error/Problem:**
Session is undefined in load function

**Code snippet:**
\`\`\`typescript
export const load = async ({ locals }) => {
  console.log(locals.session); // undefined
};
\`\`\`
```

---

## Recognition

Contributors are recognized in:
- **Git history** - All commits attributed to you
- **Release notes** - Mentioned in changelog
- **README** - Listed as contributor

---

## Code of Conduct

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and helpful
- **Be patient** with newcomers
- **Focus on what's best** for the project

### Not Acceptable

- Harassment or discrimination
- Trolling or insulting comments
- Personal attacks
- Unprofessional conduct

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Thank You!

Your contributions make Driplo better for everyone. We appreciate your time and effort! 🎉

---

## See Also

- [README.md](./README.md) - Project overview
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
- [TESTING.md](./TESTING.md) - Testing strategy
- [ROADMAP.md](./ROADMAP.md) - Current priorities