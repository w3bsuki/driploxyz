import { test, expect } from '@playwright/test'

test.describe('Auth flow', () => {
  test('signup → verify UI → login → logout', async ({ page }) => {
    // Go to homepage
    await page.goto('/')
    
    // Navigate to signup
    await page.getByRole('link', { name: /sign up|регистрация/i }).click()
    await expect(page).toHaveURL(/signup/)
    
    // Fill signup form
    const testEmail = `test${Date.now()}@example.com`
    await page.getByLabel(/email/i).fill(testEmail)
    await page.getByLabel(/password/i).fill('TestPassword123!')
    
    // Submit signup form
    await page.getByRole('button', { name: /sign up|регистрация/i }).click()
    
    // Should show verification message
    await expect(page.getByText(/check your email|проверете си имейла/i)).toBeVisible()
    
    // Navigate to login (simulate email verification by going to login directly)
    await page.goto('/login')
    
    // Fill login form with test user (use a known test user for login test)
    await page.getByLabel(/email/i).fill('testuser@example.com')
    await page.getByLabel(/password/i).fill('TestPassword123!')
    
    // Submit login form
    await page.getByRole('button', { name: /log in|влизане/i }).click()
    
    // Should redirect to dashboard or home after login
    await expect(page).toHaveURL(/dashboard|\//)
    
    // Check if user menu is visible (indicates successful login)
    await expect(page.getByRole('button', { name: /profile|профил/i }).or(page.locator('[data-user-menu]'))).toBeVisible()
    
    // Logout
    await page.getByRole('button', { name: /profile|профил/i }).or(page.locator('[data-user-menu]')).click()
    await page.getByRole('menuitem', { name: /log out|излизане/i }).click()
    
    // Should redirect to home and show login link
    await expect(page).toHaveURL('/')
    await expect(page.getByRole('link', { name: /log in|влизане/i })).toBeVisible()
  })
  
  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    
    await page.getByLabel(/email/i).fill('invalid@example.com')
    await page.getByLabel(/password/i).fill('wrongpassword')
    
    await page.getByRole('button', { name: /log in|влизане/i }).click()
    
    // Should show error message
    await expect(page.getByText(/invalid credentials|грешни данни/i)).toBeVisible()
  })
})