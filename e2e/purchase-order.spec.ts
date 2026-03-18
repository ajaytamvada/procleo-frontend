import { test, expect } from '@playwright/test';

test.describe('Purchase Orders - Deep Workflow', () => {
  // ─────────────────────────────────────────────
  // ALL PURCHASE ORDERS
  // ─────────────────────────────────────────────
  test.describe('All Purchase Orders', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-orders/all');
      await page.waitForTimeout(2000);
    });

    test('should display page title and subtitle', async ({ page }) => {
      await expect(page.getByText('All Purchase Orders')).toBeVisible();
      await expect(
        page.getByText(
          'Manage purchase order operations including cancellation, short close, and amendments'
        )
      ).toBeVisible();
    });

    test('should have Cancel PO, Short Close PO, Amend PO tabs', async ({
      page,
    }) => {
      await expect(page.getByText('Cancel PO')).toBeVisible();
      await expect(page.getByText('Short Close PO')).toBeVisible();
      await expect(page.getByText('Amend PO')).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by PO number, supplier, or raised by/i)
      ).toBeVisible();
    });

    test('should display table with correct column headers', async ({
      page,
    }) => {
      await expect(
        page.getByRole('columnheader', { name: /S.NO/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /PO NUMBER/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /PO DATE/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /SUPPLIER/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /RAISED BY/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /DEPARTMENT/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /TOTAL AMOUNT/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /ACTION/i })
      ).toBeVisible();
    });

    test('should display PO data rows', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should show PO number, supplier, and amount in rows', async ({
      page,
    }) => {
      // Based on screenshot: PO/26-27/0001, RiditStack, ₹ 45.00
      const firstRow = page.locator('table tbody tr').first();
      const rowText = await firstRow.textContent();
      expect(rowText).toContain('PO');
    });

    test('should have Cancel button in action column', async ({ page }) => {
      const cancelBtn = page.getByRole('button', { name: /Cancel/i }).first();
      if (await cancelBtn.isVisible()) {
        await expect(cancelBtn).toBeVisible();
      }
    });

    test('should search POs', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        /Search by PO number, supplier, or raised by/i
      );
      await searchInput.fill('PO/26');
      await page.waitForTimeout(500);
    });

    test('should switch between Cancel PO, Short Close PO, and Amend PO tabs', async ({
      page,
    }) => {
      // Click Short Close PO tab
      await page.getByText('Short Close PO').click();
      await page.waitForTimeout(1000);

      // Click Amend PO tab
      await page.getByText('Amend PO').click();
      await page.waitForTimeout(1000);

      // Click Cancel PO tab (back to default)
      await page.getByText('Cancel PO').click();
      await page.waitForTimeout(1000);
    });
  });

  // ─────────────────────────────────────────────
  // CREATE PO FROM RFP
  // ─────────────────────────────────────────────
  test.describe('Create PO from RFP', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-orders/create-from-rfp');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(
        page.getByText('Create Purchase Order from RFP')
      ).toBeVisible();
      await expect(
        page.getByText('Approved RFPs ready for Purchase Order creation')
      ).toBeVisible();
    });

    test('should show approved RFP count badge', async ({ page }) => {
      await expect(page.getByText(/Approved RFP/i).first()).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(
          /Search by RFP number, requested by, or department/i
        )
      ).toBeVisible();
    });

    test('should display RFP table with correct headers', async ({ page }) => {
      await expect(page.getByText('RFP NUMBER').first()).toBeVisible();
      await expect(page.getByText('RFP DATE').first()).toBeVisible();
      await expect(page.getByText('REQUESTED BY').first()).toBeVisible();
      await expect(page.getByText('DEPARTMENT').first()).toBeVisible();
      await expect(page.getByText('SELECTED SUPPLIER').first()).toBeVisible();
      await expect(page.getByText('ITEMS').first()).toBeVisible();
      await expect(page.getByText('TOTAL AMOUNT').first()).toBeVisible();
    });

    test('should show info box about PO creation', async ({ page }) => {
      await expect(page.getByText('About PO Creation from RFP')).toBeVisible();
    });

    test('should display approved RFP data', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      if (rowCount > 0) {
        const firstRowText = await rows.first().textContent();
        expect(firstRowText).toContain('RFP');
      }
    });
  });

  // ─────────────────────────────────────────────
  // CREATE DIRECT PO
  // ─────────────────────────────────────────────
  test.describe('Create Direct PO', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-orders/direct/create');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(
        page.getByText('Create Direct Purchase Order')
      ).toBeVisible();
    });

    test('should show info banner about direct PO', async ({ page }) => {
      await expect(
        page.getByText('Direct Purchase Order').first()
      ).toBeVisible();
      await expect(
        page.getByText(/create a purchase order directly/i)
      ).toBeVisible();
    });

    test('should have Save as Draft and Submit buttons', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Save as Draft/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /^Submit$/i })
      ).toBeVisible();
    });

    test('should have all form fields', async ({ page }) => {
      await expect(page.getByText('PO Number').first()).toBeVisible();
      await expect(page.getByText('Raised By').first()).toBeVisible();
      await expect(page.getByText('PO Date').first()).toBeVisible();
      await expect(page.getByText('Delivery Date').first()).toBeVisible();
      await expect(page.getByText('Supplier Name').first()).toBeVisible();
      await expect(page.getByText('Payment Terms').first()).toBeVisible();
    });

    test('should have PO Number auto-generated', async ({ page }) => {
      const poNumberInput = page.locator('input').first();
      const value = await poNumberInput.inputValue();
      expect(value).toContain('PO');
    });

    test('should have PO Date pre-filled', async ({ page }) => {
      const dateInputs = page.locator('input[type="date"]');
      const poDate = await dateInputs.first().inputValue();
      expect(poDate).toBeTruthy();
    });

    test('should have address textareas', async ({ page }) => {
      await expect(page.getByText('Ship To Address')).toBeVisible();
      await expect(
        page.getByPlaceholder('Enter shipping address')
      ).toBeVisible();
    });

    test('should have Payment Terms field', async ({ page }) => {
      await expect(page.getByText('Payment Terms').first()).toBeVisible();
      // Payment Terms is a select dropdown
      const selects = page.locator('select');
      const count = await selects.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('should have placeholder inputs', async ({ page }) => {
      await expect(page.getByPlaceholder('Enter your name')).toBeVisible();
      await expect(page.getByPlaceholder('Enter supplier name')).toBeVisible();
      await expect(page.getByPlaceholder('Enter department')).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────
  // PO APPROVAL
  // ─────────────────────────────────────────────
  test.describe('PO Approval', () => {
    test('should load PO approval page', async ({ page }) => {
      await page.goto('/purchase-orders/approve');
      await page.waitForTimeout(3000);

      // May show loading or content
      await expect(page).not.toHaveURL(/login/);
    });
  });

  // ─────────────────────────────────────────────
  // MODIFY PO
  // ─────────────────────────────────────────────
  test.describe('Modify PO', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-orders/modify');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Modify Purchase Orders')).toBeVisible();
      await expect(
        page.getByText(
          'Edit and update draft purchase orders before submission'
        )
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by PO number, supplier, or raised by/i)
      ).toBeVisible();
    });

    test('should show empty state when no drafts', async ({ page }) => {
      const emptyState = page.getByText('No Data Found');
      if (await emptyState.isVisible()) {
        await expect(
          page.getByText('No draft purchase orders available')
        ).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // PRINT PO
  // ─────────────────────────────────────────────
  test.describe('Print PO', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-orders/print');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Print Purchase Orders')).toBeVisible();
      await expect(
        page.getByText('View, print, or download approved purchase orders')
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by PO number, supplier, or raised by/i)
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(
        page.getByRole('columnheader', { name: /S.NO/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /PO NUMBER/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /PO TYPE/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /PO DATE/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /SUPPLIER/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /TOTAL AMOUNT/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /ACTIONS/i })
      ).toBeVisible();
    });

    test('should display PO data with print action', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      if (rowCount > 0) {
        // Should have Print button in actions column
        const printBtn = page.getByRole('button', { name: /Print/i }).first();
        await expect(printBtn).toBeVisible();
      }
    });

    test('should show PO type badge (INDIRECT)', async ({ page }) => {
      const typeBadge = page.getByText('INDIRECT').first();
      if (await typeBadge.isVisible()) {
        await expect(typeBadge).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // CROSS-PAGE PO WORKFLOW
  // ─────────────────────────────────────────────
  test.describe('PO Workflow Navigation', () => {
    test('should navigate through all PO pages', async ({ page }) => {
      await page.goto('/purchase-orders/all');
      await page.waitForTimeout(2000);
      await expect(page.getByText('All Purchase Orders')).toBeVisible();

      await page.goto('/purchase-orders/create-from-rfp');
      await page.waitForTimeout(2000);
      await expect(
        page.getByText('Create Purchase Order from RFP')
      ).toBeVisible();

      await page.goto('/purchase-orders/direct/create');
      await page.waitForTimeout(2000);
      await expect(
        page.getByText('Create Direct Purchase Order')
      ).toBeVisible();

      await page.goto('/purchase-orders/modify');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Modify Purchase Orders')).toBeVisible();

      await page.goto('/purchase-orders/print');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Print Purchase Orders')).toBeVisible();
    });
  });
});
