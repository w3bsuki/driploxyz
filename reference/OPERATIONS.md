# 🚀 DRIPLO OPERATIONS GUIDE

## 📦 **Deployment Process**

### **Production Pipeline**
```bash
# Pre-deployment checks
pnpm check-types        # Must pass: 0 errors
pnpm lint              # Must pass: 0 warnings  
pnpm test              # All tests green
pnpm build             # Successful build

# Deploy to staging
git push origin main   # Triggers Vercel preview
# Test at: https://driplo-preview-*.vercel.app

# Production release
git tag -a v1.0.0 -m "Production release"
git push origin v1.0.0 # Triggers production deploy
# Live at: https://driplo.com
```

### **Vercel Configuration**
```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "apps/web/.svelte-kit",
  "installCommand": "pnpm install",
  "framework": "sveltekit",
  "regions": ["fra1"],  // EU data residency
  "functions": {
    "apps/web/api/*": {
      "maxDuration": 30
    }
  }
}
```

### **Rollback Strategy**
```bash
# Instant rollback via Vercel
vercel rollback        # Interactive selection
vercel rollback [deployment-id]

# Git rollback
git revert HEAD
git push origin main

# Database rollback
psql $DATABASE_URL < backups/backup-[timestamp].sql
```

## 🔐 **Environment Variables**

### **Required Variables**
```env
# Supabase (Production)
PUBLIC_SUPABASE_URL=https://[project].supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=[secret]

# Stripe (Production)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@driplo.com

# Application
PUBLIC_SITE_URL=https://driplo.com
NODE_ENV=production
VITE_LOG_LEVEL=error

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
VERCEL_ANALYTICS_ID=[id]
```

### **Environment Management**
```bash
# Vercel CLI
vercel env pull .env.local      # Pull from Vercel
vercel env add KEY value        # Add variable
vercel env rm KEY               # Remove variable

# Local development
cp .env.example .env.local
# Edit .env.local with your values
```

## 🗄 **Database Schema**

### **Core Tables**
```sql
-- Users & Authentication
profiles               -- User profiles, settings
user_roles            -- Role assignments
sessions              -- Active sessions

-- Commerce
products              -- Product listings
product_images        -- Image gallery
categories            -- Category hierarchy
orders                -- Purchase orders
order_items          -- Order line items
payments             -- Payment records

-- Social
follows              -- User relationships
messages             -- Direct messages
reviews              -- Product/seller reviews
favorites            -- Saved products

-- Analytics
product_views        -- View tracking
search_queries       -- Search analytics
user_events          -- Event tracking
```

### **Critical Indices**
```sql
-- Performance-critical indices
CREATE INDEX idx_products_status_created ON products(status, created_at DESC);
CREATE INDEX idx_products_category ON products(category_id, status);
CREATE INDEX idx_products_user ON products(user_id, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
```

### **Database Migrations**
```bash
# Create migration
supabase migration new [description]

# Apply migrations
supabase db push              # To remote
supabase migration up         # Local only

# Generate types
pnpm db:types                 # Update TypeScript types

# Backup before migration
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

## 📊 **Monitoring & Analytics**

### **Vercel Analytics**
```javascript
// Automatic with Vercel Analytics
// Dashboard: https://vercel.com/[team]/[project]/analytics

// Custom events
import { track } from '@vercel/analytics';

track('purchase_completed', {
  value: order.total,
  currency: 'EUR',
  items: order.items.length
});
```

### **Error Tracking (Sentry)**
```javascript
// apps/web/src/hooks.client.ts
import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1
});
```

### **Performance Monitoring**
```javascript
// Web Vitals tracking
import { onCLS, onFID, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(metric)
  });
}

onCLS(sendToAnalytics);
onLCP(sendToAnalytics);
```

### **Health Checks**
```typescript
// /api/health endpoint
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    storage: await checkStorage(),
    stripe: await checkStripe(),
    redis: await checkRedis()
  };
  
  const healthy = Object.values(checks).every(v => v);
  
  return json({
    status: healthy ? 'healthy' : 'degraded',
    checks,
    timestamp: new Date().toISOString()
  }, { status: healthy ? 200 : 503 });
}
```

## 🔄 **Backup & Recovery**

### **Automated Backups**
```yaml
# Supabase automatic backups
- Daily backups: 7 days retention
- Point-in-time recovery: Last 7 days

# Additional backup script
#!/bin/bash
# Run daily via cron
DATE=$(date +%Y%m%d)
pg_dump $DATABASE_URL > /backups/db-$DATE.sql
aws s3 cp /backups/db-$DATE.sql s3://driplo-backups/
```

### **Disaster Recovery**
```bash
# Full recovery procedure
1. Create new Supabase project
2. Restore database:
   psql NEW_DATABASE_URL < backup.sql
   
3. Update environment variables:
   vercel env rm PUBLIC_SUPABASE_URL
   vercel env add PUBLIC_SUPABASE_URL [new-url]
   
4. Restore storage:
   rsync -av /backup/storage/ /new/storage/
   
5. Update DNS if needed
6. Clear CDN cache
```

## 📈 **Scaling Infrastructure**

### **Current Setup (0-10K users)**
```yaml
Web: Vercel Edge Functions
Database: Supabase (shared)
Storage: Supabase Storage
CDN: Vercel Edge Network
```

### **Phase 2 (10K-100K users)**
```yaml
Web: Vercel Pro (increased limits)
Database: Supabase Pro (dedicated)
Cache: Redis (Upstash)
CDN: Cloudflare for images
Queue: Inngest for background jobs
```

### **Phase 3 (100K+ users)**
```yaml
Web: Kubernetes cluster
Database: PostgreSQL cluster + read replicas
Cache: Redis cluster
Storage: S3 + CloudFront
Search: Elasticsearch
Queue: RabbitMQ/SQS
```

## 🚨 **Incident Response**

### **Severity Levels**
```yaml
P0 - Critical: Site down, payments broken
  Response: Immediate, all-hands
  
P1 - High: Major feature broken
  Response: Within 1 hour
  
P2 - Medium: Minor feature issues
  Response: Within 4 hours
  
P3 - Low: Cosmetic issues
  Response: Next business day
```

### **Response Runbook**
```bash
# 1. Identify issue
- Check monitoring dashboards
- Review error logs
- Reproduce issue

# 2. Communicate
- Post in #incidents Slack
- Update status page
- Notify affected users if P0/P1

# 3. Mitigate
- Rollback if regression
- Apply hotfix if possible
- Scale resources if needed

# 4. Resolve
- Deploy permanent fix
- Verify resolution
- Monitor for recurrence

# 5. Post-mortem (P0/P1 only)
- Document timeline
- Identify root cause
- Create prevention plan
```

### **Common Issues & Solutions**

**High Database Load**
```sql
-- Find slow queries
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Kill long-running queries
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE query_start < now() - interval '5 minutes';
```

**Memory Leaks**
```bash
# Restart affected service
vercel redeploy --force

# Monitor memory usage
curl https://driplo.com/api/health | jq .memory
```

**Payment Failures**
```javascript
// Check Stripe webhook logs
// Dashboard: https://dashboard.stripe.com/webhooks

// Replay failed webhooks
stripe events resend evt_xxx
```

## 🔒 **Security Procedures**

### **Regular Security Tasks**
```yaml
Daily:
  - Review authentication logs
  - Check for unusual traffic patterns
  
Weekly:
  - Update dependencies
  - Review user reports
  - Scan for vulnerabilities
  
Monthly:
  - Rotate API keys
  - Audit admin access
  - Security training
```

### **Dependency Updates**
```bash
# Check for updates
pnpm outdated

# Update safely
pnpm update --interactive
pnpm test
pnpm build

# Security audit
pnpm audit
pnpm audit fix
```

## 📋 **Operational Checklists**

### **Daily Checks**
- [ ] Monitor error rates (<0.1%)
- [ ] Check payment success rate (>95%)
- [ ] Review user reports
- [ ] Verify backup completion
- [ ] Check system resources

### **Weekly Tasks**
- [ ] Deploy accumulated fixes
- [ ] Update dependencies
- [ ] Review analytics trends
- [ ] Clean up old logs
- [ ] Team sync meeting

### **Monthly Reviews**
- [ ] Performance analysis
- [ ] Cost optimization review
- [ ] Security audit
- [ ] Capacity planning
- [ ] Documentation updates

---

*Last Updated: August 27, 2025*
*Ops Contact: ops@driplo.com*
*On-Call: +44 xxx-xxx-xxxx*