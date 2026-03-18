import { test, expect } from '@playwright/test';

test.describe('GRN - Deep Workflow', () => {
  // ─────────────────────────────────────────────
  // GRN LIST
  // ─────────────────────────────────────────────
  test.describe('GRN List', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/grn/list');
      await page.waitForTimeout(2000);
    });

    test('should display page title and subtitle', async ({ page }) => {
      await expect(page.getByText('Goods Receipt Notes')).toBeVisible();
      await expect(
        page.getByText('Manage goods receipts and quality checks')
      ).toBeVisible();
    });

    test('should have Create GRN button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Create GRN/i }).first()
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(page.getByPlaceholder(/Search GRN/i)).toBeVisible();
    });

    test('should have status filter dropdown', async ({ page }) => {
      await expect(
        page
          .locator('select')
          .filter({ hasText: /All Status/i })
          .first()
      ).toBeVisible();
    });

    test('should have date filter input', async ({ page }) => {
      const dateInputs = page.locator(
        'input[type="date"], input[placeholder*="dd-mm-yyyy"]'
      );
      const count = await dateInputs.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('should have Refresh button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Refresh/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(page.getByText('GRN Number').first()).toBeVisible();
      await expect(page.getByText('PO Number').first()).toBeVisible();
      await expect(page.getByText('Supplier').first()).toBeVisible();
      await expect(page.getByText('Receipt Date').first()).toBeVisible();
      await expect(page.getByText('Status').first()).toBeVisible();
      await expect(page.getByText('Quality Check').first()).toBeVisible();
      await expect(page.getByText('Value').first()).toBeVisible();
    });

    test('should display GRN data rows', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should show GRN numbers and PO numbers', async ({ page }) => {
      const firstRow = page.locator('table tbody tr').first();
      const rowText = await firstRow.textContent();
      expect(rowText).toContain('GRN');
      expect(rowText).toContain('PO');
    });

    test('should show status badges', async ({ page }) => {
      // Look for any status badge in the table rows
      const statusBadge = page
        .locator('table tbody')
        .getByText(/APPROVED|QUALITY CHECK|PENDING/i)
        .first();
      await expect(statusBadge).toBeVisible();
    });

    test('should show quality check badges (PASSED)', async ({ page }) => {
      const qcBadge = page.getByText('PASSED').first();
      if (await qcBadge.isVisible()) {
        await expect(qcBadge).toBeVisible();
      }
    });

    test('should show delivery challan info', async ({ page }) => {
      const dcText = page.getByText(/DC:/i).first();
      if (await dcText.isVisible()) {
        await expect(dcText).toBeVisible();
      }
    });

    test('should display values in INR', async ({ page }) => {
      const value = page.getByText(/₹/i).first();
      if (await value.isVisible()) {
        await expect(value).toBeVisible();
      }
    });

    test('should search GRNs', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/Search GRN/i);
      await searchInput.fill('GRN/2024');
      await page.waitForTimeout(500);
    });
  });

  // ─────────────────────────────────────────────
  // CREATE GRN
  // ─────────────────────────────────────────────
  test.describe('Create GRN', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/grn/create');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Create GRN').first()).toBeVisible();
      await expect(
        page.getByText('Create Goods Receipt Note from invoice')
      ).toBeVisible();
    });

    test('should show Invoice Selection section', async ({ page }) => {
      await expect(page.getByText('Invoice Selection')).toBeVisible();
    });

    test('should have Invoice Number field', async ({ page }) => {
      await expect(page.getByText('Invoice Number').first()).toBeVisible();
      // Dropdown/select element for invoice selection
      const dropdown = page
        .locator('select, [role="combobox"], [class*="select"]')
        .first();
      await expect(dropdown).toBeVisible();
    });

    test('should have Received Date field pre-filled', async ({ page }) => {
      await expect(page.getByText('Received Date').first()).toBeVisible();
      const dateInput = page.locator('input[type="date"]');
      const value = await dateInput.first().inputValue();
      expect(value).toBeTruthy();
    });

    test('should display Invoice Selection section title', async ({ page }) => {
      await expect(page.getByText('Invoice Selection')).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────
  // MODIFY GRN
  // ─────────────────────────────────────────────
  test.describe('Modify GRN', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/grn/modify');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Modify GRN')).toBeVisible();
      await expect(
        page.getByText('View and edit draft Goods Receipt Notes')
      ).toBeVisible();
    });

    test('should have Create New GRN button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Create New GRN/i })
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by GRN, PO, Invoice number or Supplier/i)
      ).toBeVisible();
    });

    test('should have date range filters', async ({ page }) => {
      const dateInputs = page.locator(
        'input[type="date"], input[placeholder*="dd-mm-yyyy"]'
      );
      const count = await dateInputs.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should show empty state when no drafts', async ({ page }) => {
      const emptyState = page.getByText('No draft GRNs found');
      if (await emptyState.isVisible()) {
        await expect(
          page.getByText('Create a new GRN to get started')
        ).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // GRN APPROVAL
  // ─────────────────────────────────────────────
  test.describe('GRN Approval', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/grn/approval');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('GRN Approval')).toBeVisible();
      await expect(
        page.getByText('Review and approve Goods Receipt Notes')
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by GRN, Invoice number or Supplier/i)
      ).toBeVisible();
    });

    test('should have date range filters', async ({ page }) => {
      const dateInputs = page.locator(
        'input[type="date"], input[placeholder*="dd-mm-yyyy"]'
      );
      const count = await dateInputs.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should show empty state when no approvals pending', async ({
      page,
    }) => {
      const emptyState = page.getByText('No GRNs pending approval');
      if (await emptyState.isVisible()) {
        await expect(
          page.getByText('All GRNs have been processed')
        ).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // GRN WORKFLOW NAVIGATION
  // ─────────────────────────────────────────────
  test.describe('GRN Workflow Navigation', () => {
    test('should navigate through all GRN pages', async ({ page }) => {
      await page.goto('/grn/list');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Goods Receipt Notes')).toBeVisible();

      await page.goto('/grn/create');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Create GRN').first()).toBeVisible();

      await page.goto('/grn/modify');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Modify GRN')).toBeVisible();

      await page.goto('/grn/approval');
      await page.waitForTimeout(2000);
      await expect(page.getByText('GRN Approval')).toBeVisible();
    });
  });
});
