import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout', () => {
  test('should display header with Procleo branding', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await expect(page.getByRole('heading', { name: 'Procleo' })).toBeVisible();
  });

  test('should display sidebar with all modules', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await page.waitForTimeout(2000);

    // Check main navigation items in sidebar
    await expect(page.getByText('Purchase Requisition').first()).toBeVisible();
    await expect(page.getByText('Purchase Orders').first()).toBeVisible();
    await expect(page.getByText('GRN').first()).toBeVisible();
    await expect(page.getByText('Master Data').first()).toBeVisible();
    await expect(page.getByText('Reports').first()).toBeVisible();
  });

  test('should expand sidebar submenu on click', async ({ page }) => {
    await page.goto('/dashboard/overview');
    await page.waitForTimeout(2000);

    // Click RFP in sidebar
    await page.getByText('RFP').first().click();
    await page.waitForTimeout(500);

    // Should show submenu - look for "Create RFP" link
    await expect(
      page.getByRole('link', { name: /Create RFP/i }).first()
    ).toBeVisible();
  });

  test('should navigate to Create PR via sidebar', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await page.locator('nav').getByText('Purchase Requisition').click();
    await page.waitForTimeout(300);
    await page.locator('nav').getByText('Create PR').click();

    await expect(page).toHaveURL(/purchase-requisition\/create/);
  });

  test('should navigate to Manage PR via sidebar', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await page.locator('nav').getByText('Purchase Requisition').click();
    await page.waitForTimeout(300);
    await page.locator('nav').getByText('Manage PR').click();

    await expect(page).toHaveURL(/purchase-requisition\/manage/);
  });

  test('should have + Create button in header', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await expect(page.getByText('+ Create')).toBeVisible();
  });

  test('should open quick create dropdown', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await page.getByText('+ Create').click();
    await page.waitForTimeout(300);

    // Should show quick action items
    await expect(page.getByText('Purchase Requisition').nth(0)).toBeVisible();
  });

  test('should show System Administrator in header', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await expect(page.getByText('System Administrator')).toBeVisible();
  });

  test('should have footer with version info', async ({ page }) => {
    await page.goto('/dashboard/overview');

    await expect(page.getByText('© 2025 ProcLeo P2P')).toBeVisible();
    await expect(page.getByText('Version 1.0.0')).toBeVisible();
  });
});
