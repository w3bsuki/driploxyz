# Setup Project

Complete project setup for new developers.

## Environment Setup

1. **Check Node version**:
   ```bash
   node --version  # Should be 22.12.x (preferred) or 20.19.x
   nvm use         # Use .nvmrc version
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start development**:
   ```bash
   pnpm dev --filter web
   ```

## Verification Checklist

- [ ] All dependencies installed successfully
- [ ] Development server runs at http://localhost:5173
- [ ] Mobile viewport test at 375x667
- [ ] Quality checks pass:
  - [ ] `pnpm -w turbo run check-types` (zero errors)
  - [ ] `pnpm -w turbo run lint` (zero errors)
  - [ ] `pnpm -w turbo run test` (all pass)

## First Steps

1. Read `DEVELOPER.md` for architecture overview
2. Check `TECHNICAL.md` for Svelte 5 + SvelteKit 2 patterns
3. Review `PRODUCT.md` for feature requirements
4. Always test mobile-first (375px viewport)

## Common Issues

- **Node version mismatch**: Use `nvm use` or install Node 22.12.0
- **pnpm not found**: `npm install -g pnpm`
- **Port 5173 busy**: Change port in `vite.config.ts`
- **TypeScript errors**: Check `TECHNICAL.md` for patterns
