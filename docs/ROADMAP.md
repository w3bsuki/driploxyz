# Product Roadmap

_Last updated: 2025-10-13_
_Target Launch: Q1 2025_

## Vision

Build the world's most trusted marketplace for pre-loved luxury fashion, operating globally with localized experiences, real-time communication, and secure transactions.

## Strategic Goals

### Short Term (Q4 2024)
- **Feature Complete:** All core marketplace features functional
- **Global Ready:** Multi-region support (BG, UK, US) with automatic locale detection
- **Production Launch:** Beta release with 100+ users

### Medium Term (Q1 2025)
- **Scale:** 10,000+ active listings across 3 regions
- **Trust:** Verified seller program with badges and ratings
- **Revenue:** Transaction volume supporting team growth

### Long Term (2025+)
- **Expansion:** Additional European markets (FR, DE, ES, IT)
- **Features:** AI-powered recommendations, virtual try-on, authentication services
- **Community:** Brand partnerships and exclusive drops

---

## Current State

### ✅ COMPLETED (October 2025)
- **Architecture:** Svelte 5 + SvelteKit 2 monorepo with Turborepo
- **Component Library:** `@repo/ui` with primitives/compositions pattern
- **Database:** 38 tables with RLS policies in Supabase
- **Auth System:** Email signup, login, verification flows
- **Product Catalog:** 45 products, 159 categories, image storage
- **Favorites:** Working favorite/unfavorite functionality
- **Messaging:** Basic message structure with conversations
- **Profiles:** User profiles with seller metrics

### 🔄 IN PROGRESS
- **Paraglide i18n:** Middleware active, needs location detection UI
- **Search:** Backend ready, needs frontend integration
- **Realtime Chat:** Structure exists, needs Supabase realtime setup

### 🎯 PLANNED (Production Roadmap)

---

## Production Roadmap (7 Weeks to Launch)

### 🚀 Phase 1: Foundation & Audit (Week 1)
**Oct 13-20, 2025**

**Objective:** Verify architecture against official docs, establish quality baseline

**Deliverables:**
- [ ] Run Svelte MCP `svelte-autofixer` on all components
- [ ] Validate SvelteKit 2 patterns (load functions, form actions, hooks)
- [ ] Audit Supabase RLS with `get_advisors` (security + performance)
- [ ] Document missing indexes and create migration plan
- [ ] Establish CI/CD quality gates (lint, check, test, build)

**Exit Criteria:**
- Zero TypeScript errors across workspace
- All Supabase advisors showing green (no critical warnings)
- Documentation updated with current patterns

---

### 🌍 Phase 2: i18n & Global Experience (Week 2)
**Oct 21-27, 2025**

**Objective:** Production-ready localization with automatic location detection

**Deliverables:**
- [ ] Implement IP-based country detection (Cloudflare + ipapi.co fallback)
- [ ] Build locale switcher banner: "Detected UK, switch to Driplo UK?"
- [ ] Verify all routes work with `/bg/`, `/en/` prefixes
- [ ] Complete message translations (audit hardcoded strings)
- [ ] Add date/number formatting for all locales
- [ ] Test cross-locale navigation (no flashing/redirects)

**Technical Tasks:**
```typescript
// Location detection in hooks.server.ts
const detectedCountry = await detectCountryFromIP(event.request);
const suggestedLocale = COUNTRY_TO_LOCALE[detectedCountry] || 'bg';
event.locals.detectedCountry = detectedCountry;
event.locals.suggestedLocale = suggestedLocale;
```

**Exit Criteria:**
- Location detection works for all supported regions
- Locale switcher UI functional and dismissible
- All routes accessible in both BG and EN

**Verification:** Manual testing from VPN (UK, US, BG IPs)

---

### 🔍 Phase 3: Search & Discovery (Week 3)
**Oct 28 - Nov 3, 2025**

**Objective:** Powerful search with filters and sorting

**Deliverables:**
- [ ] Create Supabase RPC function `search_products` with full-text search
- [ ] Build search page with URL params (`?q=dress&category=123&min_price=50`)
- [ ] Add filters UI (category, price range, size, condition, brand)
- [ ] Implement sorting (newest, price asc/desc, relevance)
- [ ] Add search autocomplete in navbar
- [ ] Optimize with indexes and query performance testing

**Database Migration:**
```sql
CREATE INDEX products_search_idx ON products USING GIN (search_vector);

CREATE FUNCTION search_products(...) RETURNS TABLE (...) AS $$
  -- Full-text search with filters
$$ LANGUAGE plpgsql STABLE;
```

**Exit Criteria:**
- Search returns results < 200ms (tested with 1000+ products)
- Filters work correctly (no broken combinations)
- Autocomplete responds < 100ms

**Verification:** Load test with k6, use Supabase MCP `get_advisors` for performance

---

### 💬 Phase 4: Realtime Features (Week 4)
**Nov 4-10, 2025**

**Objective:** Live chat with presence and notifications

**Deliverables:**
- [ ] Enable Supabase realtime for `messages` and `presence` tables
- [ ] Build chat UI with message history pagination
- [ ] Add typing indicators with presence sync
- [ ] Implement read receipts (update `read_at` timestamp)
- [ ] Show online/offline status in conversations list
- [ ] Add message notifications (in-app badge count)

**Supabase Setup:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE presence;
```

**Frontend:**
```typescript
const channel = supabase.channel(`conversation:${id}`)
  .on('postgres_changes', { event: 'INSERT', table: 'messages' }, handleNewMessage)
  .on('presence', { event: 'sync' }, updatePresence)
  .subscribe();
```

**Exit Criteria:**
- Messages appear in realtime (< 500ms latency)
- Typing indicators work smoothly
- No message duplication or ordering issues

**Verification:** Test with 2 browsers, simulate 100 concurrent users

---

### 👥 Phase 5: Social Features (Week 5)
**Nov 11-17, 2025**

**Objective:** Reviews, following, and community engagement

**Deliverables:**

#### 5.1 Review System
- [ ] Build review submission form (`/orders/{id}/review`)
- [ ] Create RPC to update profile ratings atomically
- [ ] Display reviews on seller profiles with pagination
- [ ] Add review moderation queue for admins
- [ ] Send email reminder 3 days after delivery

#### 5.2 Follow/Unfollow
- [ ] Create `/api/follow` endpoint (POST/DELETE)
- [ ] Build `FollowButton` primitive in `@repo/ui`
- [ ] Show following feed on homepage
- [ ] Add followers/following lists to profile
- [ ] Send notification when someone follows you

#### 5.3 Avatar Uploads
- [ ] Create `avatars` storage bucket in Supabase
- [ ] Add RLS policies for upload permissions
- [ ] Build avatar upload component with preview
- [ ] Implement image optimization (resize to 200x200, compress)
- [ ] Handle upload errors gracefully

**Exit Criteria:**
- Reviews appear on profiles correctly
- Following feed shows new listings from followed sellers
- Avatars upload and display across the app

**Verification:** Complete full user journey (sign up → upload avatar → follow seller → leave review)

---

### 🛒 Phase 6: Order Management (Week 6)
**Nov 18-24, 2025**

**Objective:** Complete buy/sell flows with tracking

**Deliverables:**

#### 6.1 Checkout Flow
- [ ] Bundle session creation (multiple products from same seller)
- [ ] Stripe payment intent integration
- [ ] Order confirmation page with tracking
- [ ] Send order confirmation email (Resend)
- [ ] Handle payment failures with retry

#### 6.2 Seller Dashboard
- [ ] Active listings management (edit, archive, boost)
- [ ] Order fulfillment (mark as shipped, add tracking)
- [ ] Balance and payout requests
- [ ] Sales analytics (views, favorites, conversion rate)
- [ ] Bulk operations (archive old listings)

#### 6.3 Buyer Dashboard
- [ ] Order history with status tracking
- [ ] Tracking number integration (link to carrier)
- [ ] Leave review button (after delivery)
- [ ] Favorites management (view all, remove)
- [ ] Download receipts

**Exit Criteria:**
- Complete purchase flow works end-to-end
- Sellers can manage orders and request payouts
- Buyers can track orders and leave reviews

**Verification:** Test checkout with real Stripe test cards, verify webhooks

---

### ⚡ Phase 7: Performance & Security (Week 7)
**Nov 25 - Dec 1, 2025**

**Objective:** Production-grade optimization and security hardening

**Deliverables:**

#### 7.1 Performance
- [ ] Add missing database indexes (use `get_advisors`)
- [ ] Implement query caching in SvelteKit load functions
- [ ] Optimize images with Vercel Image Optimization
- [ ] Code split large routes (lazy load components)
- [ ] Run Lighthouse CI (target: > 90 score)

#### 7.2 Security
- [ ] Audit ALL RLS policies with Supabase MCP
- [ ] Add rate limiting (Vercel Edge Config)
- [ ] Implement CAPTCHA on signup/login
- [ ] Scan for exposed secrets (environment variables)
- [ ] Add Content Security Policy headers

#### 7.3 Monitoring
- [ ] Set up Sentry for error tracking
- [ ] Add structured logging to API routes
- [ ] Create admin dashboard for system health
- [ ] Set up uptime monitoring (BetterStack)
- [ ] Configure alerts for critical errors

**Exit Criteria:**
- Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- Zero critical security issues from `get_advisors`
- Error tracking active with <1% error rate

**Verification:** Run security scan, load test with 1000 concurrent users

---

### 🎉 Phase 8: Launch (Week 8+)
**Dec 2025**

**Objective:** Go live with beta users

**Pre-Launch Checklist:**
- [ ] E2E Playwright tests for critical flows (auth, search, checkout, messaging)
- [ ] Mobile responsiveness testing (iOS Safari, Android Chrome)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)
- [ ] User guides (how to sell, buy, message)
- [ ] FAQ page with common questions
- [ ] Terms of Service + Privacy Policy
- [ ] Seller onboarding flow walkthrough

**Launch Day:**
1. Deploy to production (Vercel)
2. Configure custom domain DNS
3. Enable production Stripe keys
4. Set up transactional emails (Resend)
5. Enable analytics (Vercel Analytics + Plausible)
6. Invite beta users (100 sellers, 100 buyers)
7. Monitor errors and performance
8. Collect feedback via in-app form

**Post-Launch (Week 1):**
- Daily standup to review metrics
- Hot-fix critical bugs within 4 hours
- Respond to user feedback within 24 hours
- Iterate on onboarding based on drop-off rates

---

## Success Metrics

### Technical KPIs
| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | > 90 | TBD |
| API Response Time (p95) | < 200ms | TBD |
| Realtime Latency | < 500ms | TBD |
| Error Rate | < 1% | TBD |
| Uptime | > 99.9% | TBD |

### Product KPIs
| Metric | Target | Current |
|--------|--------|---------|
| Active Users (MAU) | 1,000 | 6 |
| Active Listings | 500 | 45 |
| Completed Transactions | 50 | 1 |
| Avg Order Value | £100 | TBD |
| Seller Retention (30d) | > 70% | TBD |

### User Experience KPIs
| Metric | Target | Current |
|--------|--------|---------|
| Time to First Listing | < 5 min | TBD |
| Search Success Rate | > 80% | TBD |
| Chat Response Time | < 2 hours | TBD |
| Review Rate | > 40% | 0% |

---

## Decision Log

### 2025-10-13: Production Roadmap Established
- Defined 8-week sprint plan to production launch
- Prioritized features based on core marketplace functionality
- Established verification strategy using Svelte/Supabase MCPs
- Set aggressive but achievable timelines with clear exit criteria

### 2025-10-13: Component Library Architecture
- Adopted snippet-based composition over slots (Svelte 5 best practice)
- Established primitives/compositions separation in `@repo/ui`
- Created pattern: primitives (pure UI) + app-specific wrappers (business logic)

### 2025-10-13: Documentation Consolidation
- Reduced from 426 MD files to 6 essential docs
- Created PRODUCTION_PLAN.md with feature checklist and verification strategy
- Established single source of truth for project documentation

---

## Risk Management

### High Priority Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| Supabase RLS misconfiguration exposes user data | CRITICAL | MEDIUM | Use `get_advisors` weekly, manual audit, penetration test |
| Realtime chat doesn't scale | HIGH | MEDIUM | Load test with 1000 concurrent users, add rate limiting |
| Payment webhook failures cause order issues | HIGH | LOW | Implement idempotency keys, retry logic, manual reconciliation |
| Poor search relevance | MEDIUM | HIGH | A/B test ranking algorithms, user feedback loop |

### Medium Priority Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| Low user adoption at launch | HIGH | MEDIUM | Beta testing program, onboarding optimization, referral incentives |
| Seller churn after onboarding | MEDIUM | MEDIUM | Seller dashboard with actionable insights, email nurture campaign |
| Mobile experience issues | MEDIUM | LOW | Comprehensive mobile testing, progressive enhancement |

---

## References

- **Detailed Plan:** [PRODUCTION_PLAN.md](./PRODUCTION_PLAN.md) - Feature checklist and implementation specs
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and monorepo structure
- **Development:** [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup and workflow guide
- **Contributing:** [CONTRIBUTING.md](./CONTRIBUTING.md) - Code standards and review process
