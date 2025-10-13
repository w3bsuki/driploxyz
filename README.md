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

**Learn more:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

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

**Learn more:** [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)

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

### Essential Docs (Start Here)
- **[PRODUCTION_PLAN.md](./docs/PRODUCTION_PLAN.md)** 🚀 - Complete feature checklist and 7-week launch plan
- **[ROADMAP.md](./docs/ROADMAP.md)** 🗺️ - Product vision and phased delivery timeline
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** 📘 - System design, monorepo structure, tech stack
- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** 🛠️ - Setup, commands, troubleshooting
- **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** 🤝 - Git workflow, code standards, quality gates

### Quick Links
- **Feature Status:** See [PRODUCTION_PLAN.md](./docs/PRODUCTION_PLAN.md#feature-checklist)
- **Current Sprint:** Week 1 - Foundation & Audit
- **Next Milestone:** i18n Location Detection (Week 2)

---

## 🤝 Contributing

We welcome contributions! See [docs/CONTRIBUTING.md](./docs/CONTRIBUTING.md) for detailed guidelines.

### Quick Start
1. Fork repository
2. Create feature branch (`feature/<scope>-<description>`)
3. Make changes following [Svelte 5 best practices](./docs/CONTRIBUTING.md#development-standards)
4. Pass all quality gates: `pnpm lint && pnpm check && pnpm test && pnpm build`
5. Open Pull Request with verification commands

---

## 📈 Project Status

**Current Phase:** Production Readiness Sprint ([docs/PRODUCTION_PLAN.md](./docs/PRODUCTION_PLAN.md))  
**Target Launch:** Q1 2025 (7 weeks)  
**Active Sprint:** Week 1 - Foundation & Audit

### Key Metrics
- ✅ **Architecture:** Svelte 5 + SvelteKit 2 with Turborepo
- ✅ **Database:** 38 tables with RLS policies in Supabase
- ✅ **Component Library:** Snippet-based composition in `@repo/ui`
- 🔄 **Features:** Auth ✅ | Search 🔄 | Chat 🔄 | Reviews 🎯 | Orders 🎯
- 🎯 **Production:** Location detection, realtime, search, reviews, orders to complete

### Essential Documentation
- 📘 **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Monorepo structure, tech stack, conventions
- 🛠️ **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Environment setup, commands, troubleshooting  
- 🗺️ **[ROADMAP.md](./docs/ROADMAP.md)** - 8-week sprint plan with exit criteria  
- 🚀 **[PRODUCTION_PLAN.md](./docs/PRODUCTION_PLAN.md)** - Feature checklist, verification strategy  
- 🤝 **[CONTRIBUTING.md](./docs/CONTRIBUTING.md)** - Code standards, Git workflow, MCP usage

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/your-org/driplo-turbo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/driplo-turbo/discussions)

---

**Built with ❤️ by the Driplo team**