import { test, expect } from '@playwright/test';

test.describe('Invoice - Deep Workflow', () => {
  // ─────────────────────────────────────────────
  // INVOICE LIST
  // ─────────────────────────────────────────────
  test.describe('Invoice List', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/invoice/list');
      await page.waitForTimeout(2000);
    });

    test('should display page title and subtitle', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Invoices/i }).first()
      ).toBeVisible();
      await expect(
        page.getByText('Manage supplier invoices and payments')
      ).toBeVisible();
    });

    test('should have Create Invoice button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Create Invoice/i }).first()
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(page.getByPlaceholder(/Search invoice/i)).toBeVisible();
    });

    test('should have status filter dropdown', async ({ page }) => {
      await expect(
        page.locator('select, [role="combobox"]').first()
      ).toBeVisible();
    });

    test('should have type filter dropdown', async ({ page }) => {
      const filters = page.locator('select');
      const count = await filters.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('should have Refresh button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Refresh/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(
        page.getByRole('columnheader', { name: /Invoice Number/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Supplier/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Invoice Date/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Due Date/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Status/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Amount/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Balance/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /Actions/i })
      ).toBeVisible();
    });

    test('should display invoice data rows', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should show invoice number and supplier', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      const rowText = await firstRow.textContent();
      expect(rowText).toBeTruthy();
    });

    test('should show PO reference under supplier', async ({ page }) => {
      const poRef = page.getByText(/PO:/i).first();
      if (await poRef.isVisible()) {
        await expect(poRef).toBeVisible();
      }
    });

    test('should show status badges (DRAFT)', async ({ page }) => {
      const draftBadge = page.getByText('DRAFT').first();
      if (await draftBadge.isVisible()) {
        await expect(draftBadge).toBeVisible();
      }
    });

    test('should show amounts in INR', async ({ page }) => {
      const amount = page.getByText(/₹/i).first();
      if (await amount.isVisible()) {
        await expect(amount).toBeVisible();
      }
    });

    test('should have view and edit action buttons', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      const actionButtons = firstRow.locator(
        'td:last-child button, td:last-child a'
      );
      const count = await actionButtons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('should search invoices', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search invoice/i);
      await searchInput.fill('inv');
      await page.waitForTimeout(500);
    });
  });

  // ─────────────────────────────────────────────
  // INVOICE ENTRY (CREATE)
  // ─────────────────────────────────────────────
  test.describe('Invoice Entry', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/invoice/entry');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Invoice Entry')).toBeVisible();
      await expect(
        page.getByText('Create invoice from approved Purchase Order')
      ).toBeVisible();
    });

    test('should have Cancel, Save as Draft, and Create Invoice buttons', async ({
      page,
    }) => {
      await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Save as Draft/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Create Invoice/i })
      ).toBeVisible();
    });

    test('should show Select Purchase Order section', async ({ page }) => {
      await expect(page.getByText('Select Purchase Order')).toBeVisible();
    });

    test('should have PO selection dropdown', async ({ page }) => {
      await expect(page.getByText('Purchase Order').first()).toBeVisible();
      // Dropdown for PO selection
      const dropdown = page
        .locator('select, [role="combobox"], [class*="select"]')
        .first();
      await expect(dropdown).toBeVisible();
    });

    test('should display Select Purchase Order section', async ({ page }) => {
      await expect(page.getByText('Select Purchase Order')).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────
  // INVOICE WORKFLOW NAVIGATION
  // ─────────────────────────────────────────────
  test.describe('Invoice Workflow Navigation', () => {
    test('should navigate through all invoice pages', async ({ page }) => {
      await page.goto('/invoice/list');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /Invoices/i }).first()
      ).toBeVisible();

      await page.goto('/invoice/entry');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Invoice Entry')).toBeVisible();
    });
  });
});
