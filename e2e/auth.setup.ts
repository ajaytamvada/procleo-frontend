import { test as setup, expect } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

const TEST_USER = {
  username: 'admin',
  password: 'admin123',
};

setup('authenticate', async ({ page }) => {
  await page.goto('/auth/login');

  await page.locator('#username').fill(TEST_USER.username);
  await page.locator('#password').fill(TEST_USER.password);
  await page
    .locator('button[type="submit"]')
    .filter({ hasText: /Log In/i })
    .click();

  // Wait for redirect to dashboard
  await page.waitForURL('**/dashboard/**', { timeout: 15000 });
  await expect(page.locator('header')).toBeVisible();

  // Save authentication state
  await page.context().storageState({ path: authFile });
});
