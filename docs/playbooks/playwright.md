# Playwright Playbook

Best practices
- Keep fast “smokes” for the golden paths; run on PR and post‑deploy.
- Add a11y checks (axe/pa11y) for core pages.
- Prefer data‑testids sparingly; use roles/labels where possible.

Refactor tasks (smokes to implement)
- [ ] Auth: signup → verify UI → login → logout
- [ ] Onboarding: complete username/avatar/payout
- [ ] Sell: create listing (with images) → redirect to product
- [ ] Search: query + filter + paginate
- [ ] Buy: checkout (test keys) → order visible
- [ ] Orders: mark shipped → mark received
- [ ] Reviews: leave a review after delivered

Snippets
```ts
import { test, expect } from '@playwright/test'

test('auth flow', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Sign up' }).click()
  // … fill and submit
  await expect(page.getByText('Check your email')).toBeVisible()
})
```

Short prompts
- “Add Playwright smokes for auth, sell, search, buy, orders, reviews; add axe checks to home/product/search/checkout.”
