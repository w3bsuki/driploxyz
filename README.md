# Driplo - Modern Marketplace Platform

> High-performance, multi-tenant marketplace built with SvelteKit 2, Svelte 5, and Supabase.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.36-orange.svg)](https://kit.svelte.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5.36-red.svg)](https://svelte.dev/)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.12.x ([install with nvm](https://github.com/nvm-sh/nvm))
- pnpm 8.15.6+ (`npm install -g pnpm`)
- Supabase account (database and auth)
- Stripe account (payments)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/driplo-turbo.git
cd driplo-turbo

# Use correct Node version
nvm use

# Install dependencies
pnpm install

# Set up environment
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your credentials

# Run migrations (optional, for local Supabase)
pnpm supabase db push

# Start development
pnpm dev --filter web
```

Visit [http://localhost:5173](http://localhost:5173)

---

## 📦 Project Structure

```
driplo-turbo/
├── apps/
│   ├── web/              # Main storefront (SvelteKit 2 + Svelte 5)
│   ├── admin/            # Admin dashboard
│   └── docs/             # Marketing site
├── packages/
│   ├── ui/               # Shared UI components
│   ├── core/             # Business logic & services
│   ├── database/         # Supabase types & schema
│   ├── i18n/             # Paraglide localization
│   └── eslint-config/    # Shared ESLint config
├── supabase/             # Database migrations & functions
└── turbo.json            # Turborepo configuration
```

**Learn more:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🛠️ Development

### Commands

```bash
# Development
pnpm dev                  # Start all apps
pnpm dev --filter web     # Start web app only

# Building
pnpm build                # Build all packages
pnpm --filter web build   # Build web app

# Quality
pnpm lint                 # Lint all
pnpm check-types          # Type checking
pnpm test                 # Run tests
pnpm test:e2e             # E2E tests (Playwright)

# Utilities
pnpm format               # Format with Prettier
pnpm clean                # Clean build artifacts
```

**Learn more:** [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 🎨 Tech Stack

### Frontend
- **[SvelteKit 2](https://kit.svelte.dev/)** - Application framework
- **[Svelte 5](https://svelte.dev/)** - UI framework with runes
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling
- **[Paraglide](https://inlang.com/m/ink/paraglide)** - Type-safe i18n

### Backend
- **[Supabase](https://supabase.com/)** - PostgreSQL, Auth, Storage
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Resend](https://resend.com/)** - Email delivery

### Infrastructure
- **[Vercel](https://vercel.com/)** - Hosting & deployment
- **[Turborepo](https://turbo.build/)** - Monorepo build system
- **[pnpm](https://pnpm.io/)** - Package manager

**Learn more:** [FRAMEWORKS.md](./FRAMEWORKS.md)

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Watch mode
pnpm --filter web test:watch

# E2E tests
pnpm --filter web test:e2e

# Coverage
pnpm test:coverage
```

**Coverage Requirements:**
- @repo/core: 70%
- @repo/domain: 80%
- @repo/ui: 50%
- apps/web: 40%

**Learn more:** [TESTING.md](./TESTING.md)

---

## 🗄️ Database

PostgreSQL via Supabase with Row Level Security (RLS).

### Schema
- **profiles** - User profiles and seller information
- **products** - Product listings
- **orders** - Order management
- **messages** - Peer-to-peer messaging
- **transactions** - Payment records

### Migrations

```bash
# Push migrations
pnpm supabase db push

# Generate types
pnpm --filter @repo/database db:types
```

**Learn more:** [SUPABASE.md](./SUPABASE.md)

---

## 🌍 Localization

Supported languages: 🇺🇸 English · 🇫🇷 French · 🇩🇪 German · 🇪🇸 Spanish

### Usage

```svelte
<script>
  import * as m from '@repo/i18n/messages';
</script>

<h1>{m.welcome()}</h1>
```

Edit messages in `packages/i18n/messages/`, then:
```bash
pnpm --filter @repo/i18n build
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture & design
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow
- **[FRAMEWORKS.md](./FRAMEWORKS.md)** - Framework guides
- **[SUPABASE.md](./SUPABASE.md)** - Database & auth
- **[TESTING.md](./TESTING.md)** - Testing strategy
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[ROADMAP.md](./ROADMAP.md)** - Current priorities

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Process
1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes & write tests
4. Pass quality checks (`pnpm lint check-types test build`)
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push & open Pull Request

---

## 📈 Project Status

**Current Phase:** Foundation & Architecture ([ROADMAP.md](./ROADMAP.md))

**Metrics:**
- ✅ Type Safety: 100% (0 TypeScript errors)
- ✅ Code Quality: 100% (0 lint errors)
- 🔄 Test Coverage: 25% → Target: 60%
- ✅ Build Health: 100% (all packages building)

**Next Milestones:**
- [ ] Architecture rationalization
- [ ] Test coverage baseline
- [ ] Production deployment

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/your-org/driplo-turbo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/driplo-turbo/discussions)

---

**Built with ❤️ by the Driplo team**