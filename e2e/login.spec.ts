import { test, expect } from '@playwright/test';

// Login tests run WITHOUT saved auth state
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
  });

  test('should display login form with email and password fields', async ({
    page,
  }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(
      page.locator('button[type="submit"]').filter({ hasText: /Log In/i })
    ).toBeVisible();
  });

  test('should display Registered Email Address label', async ({ page }) => {
    await expect(page.getByText('Registered Email Address')).toBeVisible();
  });

  test('should display Password label', async ({ page }) => {
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.locator('#username').fill('wrong@email.com');
    await page.locator('#password').fill('wrongpassword');
    await page
      .locator('button[type="submit"]')
      .filter({ hasText: /Log In/i })
      .click();

    // Should show error message
    await expect(page.locator('[role="alert"]')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('admin123');
    await page
      .locator('button[type="submit"]')
      .filter({ hasText: /Log In/i })
      .click();

    await page.waitForURL('**/dashboard/**', { timeout: 15000 });
    await expect(page.locator('header')).toBeVisible();
  });

  test('should show loading state while logging in', async ({ page }) => {
    await page.locator('#username').fill('admin');
    await page.locator('#password').fill('admin123');
    await page
      .locator('button[type="submit"]')
      .filter({ hasText: /Log In/i })
      .click();

    // Button should briefly show loading text
    await expect(
      page.locator('button[type="submit"]').filter({ hasText: /Signing In/i })
    ).toBeVisible({ timeout: 3000 });
  });

  test('should toggle to phone login mode', async ({ page }) => {
    await page.getByText('Continue with Phone Number').click();
    await expect(page.locator('#phoneNumber')).toBeVisible();
  });

  test('should have Forgot Password link', async ({ page }) => {
    await expect(page.getByText('Forgot Password?')).toBeVisible();
  });

  test('should have Register as Vendor link', async ({ page }) => {
    await expect(page.getByText('Register as Vendor')).toBeVisible();
  });

  test('should not allow access to dashboard without auth', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    // Should show loading or redirect to login — either way, dashboard content should NOT appear
    await page.waitForTimeout(5000);

    // The greeting should NOT be visible since we're not authenticated
    await expect(
      page.getByText(/Good (Morning|Afternoon|Evening)/)
    ).not.toBeVisible();
  });
});
