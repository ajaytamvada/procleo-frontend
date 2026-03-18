import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('should display greeting after login', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await expect(
      page
        .locator('text=Good Morning')
        .or(page.locator('text=Good Afternoon'))
        .or(page.locator('text=Good Evening'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('should display stats cards', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await page.waitForTimeout(2000);

    await expect(page.getByText('Total Purchase Value')).toBeVisible();
    await expect(page.getByText('Total Vendors')).toBeVisible();
    await expect(page.getByText('Open PO Value')).toBeVisible();
    await expect(page.getByText('Invoice Due')).toBeVisible();
  });

  test('should display live sourcing events', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await page.waitForTimeout(2000);

    await expect(page.getByText('Live Sourcing Events')).toBeVisible();
  });

  test('should display status summary section', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await page.waitForTimeout(2000);

    await expect(page.getByText('Status Summary')).toBeVisible();
  });

  test('should display recent activity section', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await page.waitForTimeout(2000);

    await expect(page.getByText('Recent Activity')).toBeVisible();
  });

  test('should have working sidebar navigation', async ({ page }) => {
    await page.goto('/dashboard/overview');

    // Click on Purchase Requisition in sidebar
    await page.locator('nav').getByText('Purchase Requisition').click();

    // Should show submenu items
    await expect(page.locator('nav').getByText('Create PR')).toBeVisible();
    await expect(page.locator('nav').getByText('Manage PR')).toBeVisible();
  });

  test('should have header with Procleo branding', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await expect(page.getByRole('heading', { name: 'Procleo' })).toBeVisible();
  });

  test('should have date filter dropdown', async ({ page }) => {
    await page.goto('/dashboard/overview');

    // Wait for dashboard to fully load
    await expect(page.getByText('Total Purchase Value')).toBeVisible({
      timeout: 15000,
    });

    // Date filter is a <select> element with "Last 7 days" option
    const filter = page.locator('select');
    await expect(filter.first()).toBeVisible({ timeout: 5000 });
  });
});
