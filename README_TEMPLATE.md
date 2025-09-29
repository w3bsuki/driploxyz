# Driplo - Modern Marketplace Platform

> A high-performance, multi-tenant marketplace built with SvelteKit 2, Svelte 5, and Supabase.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![SvelteKit](https://img.shields.io/badge/SvelteKit-2.36-orange.svg)](https://kit.svelte.dev/)
[![Svelte](https://img.shields.io/badge/Svelte-5.36-red.svg)](https://svelte.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.12.x ([install with nvm](https://github.com/nvm-sh/nvm))
- pnpm 8.15.6+ (`npm install -g pnpm`)
- Supabase account (for database and auth)
- Stripe account (for payments)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/driplo-turbo.git
cd driplo-turbo

# Use correct Node version
nvm use

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env
# Edit apps/web/.env with your credentials

# Run database migrations (if using local Supabase)
pnpm supabase db push

# Start development server
pnpm dev --filter web
```

Visit [http://localhost:5173](http://localhost:5173) to see the app.

---

## 📦 Project Structure

```
driplo-turbo/
├── apps/
│   ├── web/              # Main storefront (SvelteKit 2 + Svelte 5)
│   ├── admin/            # Admin dashboard
│   └── docs/             # Marketing & documentation site
├── packages/
│   ├── ui/               # Shared UI components
│   ├── core/             # Business logic & services
│   ├── domain/           # Domain models & validation
│   ├── database/         # Supabase types & schema
│   ├── i18n/             # Paraglide localization
│   └── eslint-config/    # Shared ESLint configuration
├── supabase/             # Database migrations & functions
└── turbo.json            # Turborepo configuration
```

**Learn more:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## 🛠️ Development

### Available Commands

```bash
# Development
pnpm dev                  # Start all apps
pnpm dev --filter web     # Start web app only

# Building
pnpm build                # Build all packages
pnpm --filter web build   # Build web app only

# Quality Checks
pnpm lint                 # Lint all packages
pnpm check-types          # TypeScript type checking
pnpm test                 # Run all tests
pnpm test:e2e             # Run E2E tests (Playwright)

# Utilities
pnpm format               # Format code with Prettier
pnpm clean                # Clean build artifacts
```

**Learn more:** [DEVELOPMENT.md](./DEVELOPMENT.md)

---

## 🧪 Testing

We use **Vitest** for unit tests and **Playwright** for E2E tests.

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm --filter web test:watch

# Run E2E tests
pnpm --filter web test:e2e

# Generate coverage report
pnpm test:coverage
```

**Coverage Requirements:**
- @repo/core: 70%
- @repo/domain: 80%
- @repo/ui: 50%
- apps/web: 40% (integration tests)

**Learn more:** [TESTING.md](./TESTING.md)

---

## 🎨 Tech Stack

### Frontend
- **[SvelteKit 2](https://kit.svelte.dev/)** - Application framework
- **[Svelte 5](https://svelte.dev/)** - UI framework with runes API
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling
- **[Paraglide](https://inlang.com/m/ink/paraglide)** - Type-safe i18n

### Backend
- **[Supabase](https://supabase.com/)** - PostgreSQL database, Auth, Storage
- **[Stripe](https://stripe.com/)** - Payment processing
- **[Resend](https://resend.com/)** - Email delivery

### Infrastructure
- **[Vercel](https://vercel.com/)** - Hosting & deployment
- **[Turborepo](https://turbo.build/)** - Monorepo build system
- **[pnpm](https://pnpm.io/)** - Fast, disk-efficient package manager

**Learn more:** [FRAMEWORKS.md](./FRAMEWORKS.md)

---

## 🗄️ Database

We use Supabase for PostgreSQL with Row Level Security (RLS).

### Schema Overview
- **profiles** - User profiles and seller information
- **products** - Product listings
- **orders** - Order management
- **messages** - Peer-to-peer messaging
- **transactions** - Payment records

### Running Migrations

```bash
# Using Supabase CLI
pnpm supabase db push

# Generate TypeScript types
pnpm --filter @repo/database db:types
```

**Learn more:** [SUPABASE.md](./SUPABASE.md)

---

## 🌍 Localization

We support multiple languages using Paraglide:
- 🇺🇸 English (en)
- 🇫🇷 French (fr)
- 🇩🇪 German (de)
- 🇪🇸 Spanish (es)

### Adding Translations

1. Edit messages in `packages/i18n/messages/`
2. Regenerate bundles: `pnpm --filter @repo/i18n build`
3. Use in components:
   ```svelte
   <script>
     import * as m from '@repo/i18n/messages';
   </script>

   <h1>{m.welcome()}</h1>
   ```

**Learn more:** [FRAMEWORKS.md](./FRAMEWORKS.md#paraglide)

---

## 🚢 Deployment

### Production Deployment

```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

### Environment Variables

Required environment variables:
```bash
# Supabase
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
RESEND_API_KEY=

# Monitoring
PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

Copy `apps/web/.env.example` and fill in your values.

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Development workflow and commands
- **[FRAMEWORKS.md](./FRAMEWORKS.md)** - Framework-specific guides
- **[SUPABASE.md](./SUPABASE.md)** - Database schema and auth setup
- **[TESTING.md](./TESTING.md)** - Testing strategy and patterns
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[ROADMAP.md](./ROADMAP.md)** - Current priorities and progress

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all checks pass (`pnpm lint check-types test build`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to your branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

---

## 📈 Project Status

**Current Phase:** Foundation & Architecture (see [ROADMAP.md](./ROADMAP.md))

**Key Metrics:**
- ✅ Type Safety: 100% (0 TypeScript errors)
- ✅ Code Quality: 100% (0 lint errors)
- 🔄 Test Coverage: 25% → Target: 60%
- ✅ Build Health: 100% (all packages building)

**Next Milestones:**
- [ ] Complete architecture rationalization
- [ ] Establish test coverage baseline
- [ ] Deploy v1.0 to production

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[SvelteKit](https://kit.svelte.dev/)** - Amazing framework
- **[Supabase](https://supabase.com/)** - Database made simple
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[Stripe](https://stripe.com/)** - Payment infrastructure

---

## 📞 Support

- **Documentation:** [./docs](./docs)
- **Issues:** [GitHub Issues](https://github.com/your-org/driplo-turbo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/driplo-turbo/discussions)
- **Email:** support@driplo.com

---

**Built with ❤️ by the Driplo team**