# Lighthouse CI Setup for Driplo

This document describes the Lighthouse CI configuration for the Driplo web application, designed to enforce performance budgets and prevent regressions according to the PRODUCTION_REFACTOR_PLAN.md requirements.

## Performance Budgets

Based on PRODUCTION_REFACTOR_PLAN.md, our targets are:
- **Mobile LCP < 2.5s** - Critical for user experience
- **Total Blocking Time (TBT) < 200ms** - Essential for interactivity
- **Cumulative Layout Shift (CLS) < 0.1** - Prevents visual instability
- **Performance Score ≥ 90%** - Overall mobile performance target

## Configuration Files

### `.lighthouserc.json` (Local Development)
Primary configuration for local testing with:
- Mobile-first emulation (375x667, iPhone SE dimensions)
- 3G Fast network throttling
- 5 runs for statistical significance
- Local server startup and management

### `.lighthouserc.ci.json` (CI/Staging/Production)
Environment-agnostic configuration using environment variables:
- `${LIGHTHOUSE_BASE_URL}` placeholder for dynamic URL configuration
- Optimized for CI environments with 3 runs
- Same performance budgets as local config

### `.lighthouserc.yml` (Alternative YAML Config)
YAML version with detailed comments, useful for reference and documentation.

## Critical Pages Tested

1. **Homepage** (`/`) - Landing page performance and initial load
2. **Search** (`/search`) - Search interface and filter performance  
3. **Search Results** (`/search?q=shoes&category=sneakers`) - Search results with filters
4. **Category Page** (`/category/women`) - Category browsing with filters
5. **Product Detail** (`/product/1`) - Individual product page performance
6. **Checkout** (`/checkout`) - Critical conversion path

## Usage

### Local Development

```bash
# Run Lighthouse CI locally (builds and tests against localhost:4173)
npm run lighthouse:local

# Or use the direct turbo command
npm run lighthouse
```

### Staging Environment

```bash
# Test against staging environment
npm run lighthouse:staging
```

### Production Environment

```bash
# Test against production (use with caution)
npm run lighthouse:production
```

### CI Integration

```bash
# In CI environments, set LIGHTHOUSE_BASE_URL and use:
LIGHTHOUSE_BASE_URL=https://staging.driplo.com npm run lighthouse:ci
```

## Integration with Turbo

The Lighthouse CI is fully integrated with the Turbo monorepo pipeline:

- `turbo lighthouse` - Runs Lighthouse CI with build dependencies
- `turbo performance-audit` - Full performance audit including Lighthouse CI and Playwright performance tests
- `turbo test:performance` - Playwright performance tests only

### Turbo Task Dependencies

```json
{
  "lighthouse": {
    "dependsOn": ["^build"],
    "inputs": [".lighthouserc.*"],
    "outputs": [".lighthouseci/**"]
  },
  "performance-audit": {
    "dependsOn": ["^build", "lighthouse", "test:performance"],
    "outputs": ["performance-test-results/**", ".lighthouseci/**"]
  }
}
```

## Performance Budget Enforcement

### Error-Level Violations (CI Fails)
- Performance score < 90%
- LCP > 2.5s
- TBT > 200ms  
- CLS > 0.1
- Accessibility score < 95%
- Missing image alt text
- Color contrast violations
- HTML validation errors

### Warning-Level Issues (CI Passes with Warnings)
- FCP > 1.8s
- Speed Index > 3s
- Interactive > 4s
- Missing optimizations (WebP, compression, preconnect)
- SEO improvements

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run Performance Tests
  run: |
    export LIGHTHOUSE_BASE_URL="https://staging.driplo.com"
    npm run performance-audit
```

### Vercel Preview Deployments

```yaml
- name: Test Preview Deployment
  run: |
    export LIGHTHOUSE_BASE_URL="${{ steps.vercel.outputs.preview-url }}"
    npm run lighthouse:ci
```

## Troubleshooting

### Common Issues

1. **Server not starting locally**
   - Check if port 4173 is available
   - Ensure the build completed successfully
   - Check the server startup logs

2. **Performance budget failures**
   - Review the HTML report in `.lighthouseci/lhci_reports/`
   - Check network throttling is working correctly
   - Verify mobile emulation settings

3. **CI environment issues**
   - Ensure `LIGHTHOUSE_BASE_URL` is set correctly
   - Check Chrome/Chromium is available in CI
   - Verify network access to the target URL

### Debug Commands

```bash
# Validate configuration
npx lhci healthcheck

# Run only collection (no assertions)
npx lhci collect --url=http://localhost:4173

# Open HTML reports
npx lhci open
```

## Monitoring and Alerts

The Lighthouse CI results are stored in:
- Local: `.lighthouseci/` directory
- CI: Temporary public storage (configurable)
- HTML reports: Available for detailed performance analysis

Performance regressions will cause CI builds to fail, preventing deployment of performance-degraded code.

## Mobile-First Configuration

All tests use mobile emulation by default:
- Device: iPhone SE (375x667)
- Network: 3G Fast (1.6 Mbps down, 750 Kbps up, 150ms RTT)
- CPU: 4x throttling (low-end device simulation)

This ensures performance budgets reflect real-world mobile user experience, aligned with Driplo's mobile-first approach.