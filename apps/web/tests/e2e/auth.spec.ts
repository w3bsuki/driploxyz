import { test, expect } from '@playwright/test';
import { createTestUser, deleteTestUser, generateTestEmail } from '../utils/test-helpers';

test.describe('Authentication Flow', () => {
  let testEmail: string;
  let testPassword: string;

  test.beforeEach(async () => {
    testEmail = generateTestEmail();
    testPassword = 'TestPassword123!';
  });

  test.afterEach(async () => {
    // Clean up test user if exists
    await deleteTestUser(testEmail);
  });

  test('should complete full signup flow', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/signup');
    
    // Check page title and heading
    await expect(page).toHaveTitle(/Sign Up - Driplo/);
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

    // Fill signup form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByLabel('Confirm Password').fill(testPassword);
    
    // Accept terms
    await page.getByLabel('I agree to the Terms').check();
    
    // Submit form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Should redirect to onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Complete onboarding
    await page.getByLabel('Username').fill('testuser123');
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Bio').fill('Test bio for marketplace');
    await page.getByRole('button', { name: 'Complete Setup' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Welcome to Driplo')).toBeVisible();
  });

  test('should handle login with existing user', async ({ page }) => {
    // Create test user first
    await createTestUser(testEmail, testPassword);

    // Navigate to login page
    await page.goto('/login');
    
    // Check page elements
    await expect(page).toHaveTitle(/Login - Driplo/);
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();

    // Fill login form
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Check user menu is visible
    await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    
    // Submit form
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should show error message
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    
    // Should remain on login page
    await expect(page).toHaveURL('/login');
  });

  test('should handle logout', async ({ page }) => {
    // Create and login test user
    await createTestUser(testEmail, testPassword);
    await page.goto('/login');
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill(testPassword);
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');

    // Open user menu and logout
    await page.getByRole('button', { name: 'User menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign Out' }).click();

    // Should redirect to home page
    await expect(page).toHaveURL('/');
    
    // Login button should be visible
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
  });

  test('should enforce authentication on protected routes', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL('/login?redirect=/dashboard');
    
    // Should show message
    await expect(page.getByText('Please sign in to continue')).toBeVisible();
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/login');
    
    // Click forgot password
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    
    // Should navigate to reset page
    await expect(page).toHaveURL('/reset-password');
    
    // Fill email
    await page.getByLabel('Email').fill(testEmail);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    
    // Should show success message
    await expect(page.getByText('Check your email for reset instructions')).toBeVisible();
  });

  test('should validate signup form fields', async ({ page }) => {
    await page.goto('/signup');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should show validation errors
    await expect(page.getByText('Email is required')).toBeVisible();
    await expect(page.getByText('Password is required')).toBeVisible();
    
    // Test weak password
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill('weak');
    await page.getByLabel('Confirm Password').fill('weak');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should show password strength error
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible();
    
    // Test password mismatch
    await page.getByLabel('Password').fill(testPassword);
    await page.getByLabel('Confirm Password').fill('DifferentPassword123!');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should show mismatch error
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should handle social login options', async ({ page }) => {
    await page.goto('/login');
    
    // Check social login buttons exist
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Facebook' })).toBeVisible();
    
    // Click Google login (mock redirect)
    await page.getByRole('button', { name: 'Continue with Google' }).click();
    
    // Should redirect to OAuth provider (mocked in test)
    await expect(page).toHaveURL(/google\.com|accounts\.google\.com/);
  });
});

test.describe('Mobile Authentication', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('should handle mobile signup flow', async ({ page }) => {
    const testEmail = generateTestEmail();
    
    await page.goto('/signup');
    
    // Mobile layout should be active
    await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
    
    // Fill form on mobile
    await page.getByLabel('Email').fill(testEmail);
    await page.getByLabel('Password').fill('TestPassword123!');
    await page.getByLabel('Confirm Password').fill('TestPassword123!');
    await page.getByLabel('I agree to the Terms').check();
    
    // Submit
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    // Should work same as desktop
    await expect(page).toHaveURL('/onboarding');
    
    // Clean up
    await deleteTestUser(testEmail);
  });
});