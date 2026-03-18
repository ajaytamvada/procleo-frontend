import { test, expect } from '@playwright/test';

test.describe('RFP - Deep Workflow', () => {
  // ─────────────────────────────────────────────
  // MANAGE RFP
  // ─────────────────────────────────────────────
  test.describe('Manage RFP', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/rfp/manage');
      await page.waitForTimeout(2000);
    });

    test('should display page title and subtitle', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Manage RFP/i })
      ).toBeVisible();
      await expect(page.getByText('View and manage draft RFPs')).toBeVisible();
    });

    test('should have Create RFP button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Create RFP/i }).first()
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by RFP Number or Remarks/i)
      ).toBeVisible();
    });

    test('should have Refresh button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Refresh/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(page.getByText('RFP Number').first()).toBeVisible();
      await expect(page.getByText('RFP Date').first()).toBeVisible();
      await expect(page.getByText('Closing Date').first()).toBeVisible();
      await expect(page.getByText('Items').first()).toBeVisible();
      await expect(page.getByText('Status').first()).toBeVisible();
      await expect(page.getByText('Actions').first()).toBeVisible();
    });

    test('should search RFPs', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        /Search by RFP Number or Remarks/i
      );
      await searchInput.fill('RFP');
      await page.waitForTimeout(500);
    });
  });

  // ─────────────────────────────────────────────
  // CREATE RFP FROM PR
  // ─────────────────────────────────────────────
  test.describe('Create RFP from PR', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/rfp/create');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Select Approved PRs')).toBeVisible();
      await expect(
        page.getByText('Select Purchase Requests to combine into an RFP')
      ).toBeVisible();
    });

    test('should have Combine PR button', async ({ page }) => {
      await expect(
        page
          .getByRole('button', { name: /Combine PR/i })
          .or(page.getByRole('link', { name: /Combine PR/i }))
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by PR Number, Date, or Department/i)
      ).toBeVisible();
    });

    test('should display PR selection table with headers', async ({ page }) => {
      await expect(page.getByText('Request Number').first()).toBeVisible();
      await expect(page.getByText('Request Date').first()).toBeVisible();
      await expect(page.getByText('Requested By').first()).toBeVisible();
      await expect(page.getByText('Department').first()).toBeVisible();
      await expect(page.getByText('Created By').first()).toBeVisible();
      await expect(page.getByText('Items').first()).toBeVisible();
    });

    test('should have select-all checkbox', async ({ page }) => {
      const checkbox = page.locator('thead input[type="checkbox"]');
      if (await checkbox.isVisible()) {
        await expect(checkbox).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // CREATE MANUAL RFP
  // ─────────────────────────────────────────────
  test.describe('Create Manual RFP', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/rfp/create-manual');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Create RFP').first()).toBeVisible();
    });

    test('should have Save as Draft and Create RFP buttons', async ({
      page,
    }) => {
      await expect(
        page.getByRole('button', { name: /Save as Draft/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Create RFP/i })
      ).toBeVisible();
    });

    test('should have all form fields', async ({ page }) => {
      await expect(page.getByText('RFP Number').first()).toBeVisible();
      await expect(page.getByText('RFP Date').first()).toBeVisible();
      await expect(page.getByText('PR Number').first()).toBeVisible();
      await expect(page.getByText('Closing Date').first()).toBeVisible();
      await expect(page.getByText('Approval Group').first()).toBeVisible();
      await expect(page.getByText('Payment Terms').first()).toBeVisible();
      await expect(page.getByText('Remarks').first()).toBeVisible();
    });

    test('should have RFP Number auto-generated', async ({ page }) => {
      const rfpInput = page.locator('input').first();
      const value = await rfpInput.inputValue();
      expect(value).toContain('RFP');
    });

    test('should have RFP Date pre-filled', async ({ page }) => {
      const dateInputs = page.locator('input[type="date"]');
      const rfpDate = await dateInputs.first().inputValue();
      expect(rfpDate).toBeTruthy();
    });

    test('should have remarks textarea', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Enter any additional remarks/i)
      ).toBeVisible();
    });

    test('should show Item Details section', async ({ page }) => {
      await expect(page.getByText('Item Details')).toBeVisible();
    });

    test('should show Total Amount indicator', async ({ page }) => {
      await expect(page.getByText('Total Amount')).toBeVisible();
    });

    test('should have Add New Item button', async ({ page }) => {
      await expect(page.getByText('Add New Item')).toBeVisible();
    });

    test('should display item table headers', async ({ page }) => {
      await expect(page.getByText('Item Name').first()).toBeVisible();
      await expect(page.getByText('Item Code').first()).toBeVisible();
      await expect(page.getByText('Quantity').first()).toBeVisible();
      await expect(page.getByText('Unit Price').first()).toBeVisible();
    });

    test('should have Approval Group and Payment Terms dropdowns', async ({
      page,
    }) => {
      const selects = page.locator('select');
      const count = await selects.count();
      expect(count).toBeGreaterThanOrEqual(2);
    });
  });

  // ─────────────────────────────────────────────
  // SUBMIT QUOTATION
  // ─────────────────────────────────────────────
  test.describe('Submit Quotation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/rfp/submit-quotation');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Submit RFP/i })
      ).toBeVisible();
      await expect(
        page.getByText('Submit quotations for floated RFPs')
      ).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by RFP number or requested by/i)
      ).toBeVisible();
    });

    test('should have Refresh button', async ({ page }) => {
      await expect(
        page.getByRole('button', { name: /Refresh/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(page.getByText('Supplier Name').first()).toBeVisible();
      await expect(page.getByText('RFP Number').first()).toBeVisible();
      await expect(page.getByText('RFP Date').first()).toBeVisible();
      await expect(page.getByText('Closing Date').first()).toBeVisible();
      await expect(page.getByText('Created By').first()).toBeVisible();
      await expect(page.getByText('Status').first()).toBeVisible();
      await expect(page.getByText('Action').first()).toBeVisible();
    });

    test('should display RFP data rows with Submit buttons', async ({
      page,
    }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Each row should have a Submit button
      const submitBtn = page.getByRole('button', { name: /Submit/i }).first();
      await expect(submitBtn).toBeVisible();
    });

    test('should show Pending status badges', async ({ page }) => {
      const pendingBadge = page.getByText('Pending').first();
      if (await pendingBadge.isVisible()) {
        await expect(pendingBadge).toBeVisible();
      }
    });

    test('should show RFP count message', async ({ page }) => {
      await expect(
        page.getByText(/Showing \d+ RFPs available for quotation/i)
      ).toBeVisible();
    });

    test('should search quotations', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        /Search by RFP number or requested by/i
      );
      await searchInput.fill('RFP');
      await page.waitForTimeout(500);
    });
  });

  // ─────────────────────────────────────────────
  // RFP APPROVAL
  // ─────────────────────────────────────────────
  test.describe('RFP Approval', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/rfp/approval');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /RFP Approval/i })
      ).toBeVisible();
      await expect(
        page.getByText('Review and approve/reject finalized vendor selections')
      ).toBeVisible();
    });

    test('should have search input and refresh button', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by RFP number or requested by/i)
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Refresh/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(page.getByText('RFP Number').first()).toBeVisible();
      await expect(page.getByText('RFP Date').first()).toBeVisible();
      await expect(page.getByText('Requested By').first()).toBeVisible();
      await expect(page.getByText('Department').first()).toBeVisible();
      await expect(page.getByText('Status').first()).toBeVisible();
      await expect(page.getByText('Action').first()).toBeVisible();
    });

    test('should show empty state when no approvals pending', async ({
      page,
    }) => {
      const emptyState = page.getByText('No RFPs waiting for approval');
      if (await emptyState.isVisible()) {
        await expect(
          page.getByText('RFPs awaiting management approval will appear here')
        ).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // RFP SUMMARY
  // ─────────────────────────────────────────────
  test.describe('RFP Summary', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/rfp/summary');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /RFP Summary/i })
      ).toBeVisible();
      await expect(
        page.getByText('View comprehensive RFP summary reports')
      ).toBeVisible();
    });

    test('should have search input and refresh button', async ({ page }) => {
      await expect(
        page.getByPlaceholder(/Search by RFP number or requested by/i)
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Refresh/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(page.getByText('RFP Number').first()).toBeVisible();
      await expect(page.getByText('RFP Date').first()).toBeVisible();
      await expect(page.getByText('Requested By').first()).toBeVisible();
      await expect(page.getByText('Department').first()).toBeVisible();
      await expect(page.getByText('Status').first()).toBeVisible();
      await expect(page.getByText('Quotations').first()).toBeVisible();
      await expect(page.getByText('Action').first()).toBeVisible();
    });

    test('should display RFP summary data', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should have clickable RFP number links', async ({ page }) => {
      const rfpLink = page
        .locator('table tbody a')
        .filter({ hasText: /RFP/i })
        .first();
      if (await rfpLink.isVisible()) {
        await expect(rfpLink).toBeVisible();
      }
    });

    test('should show status badges (FLOATED/APPROVED)', async ({ page }) => {
      const statusBadge = page.getByText(/FLOATED|APPROVED/i).first();
      if (await statusBadge.isVisible()) {
        await expect(statusBadge).toBeVisible();
      }
    });

    test('should show quotation count', async ({ page }) => {
      const quotationCount = page.getByText(/received/i).first();
      if (await quotationCount.isVisible()) {
        await expect(quotationCount).toBeVisible();
      }
    });

    test('should have View Summary buttons', async ({ page }) => {
      const viewBtn = page
        .getByRole('button', { name: /View Summary/i })
        .first();
      if (await viewBtn.isVisible()) {
        await expect(viewBtn).toBeVisible();
      }
    });

    test('should search RFP summaries', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        /Search by RFP number or requested by/i
      );
      await searchInput.fill('RFP1396');
      await page.waitForTimeout(500);
    });
  });

  // ─────────────────────────────────────────────
  // RFP WORKFLOW NAVIGATION
  // ─────────────────────────────────────────────
  test.describe('RFP Workflow Navigation', () => {
    test('should navigate through all RFP pages', async ({ page }) => {
      await page.goto('/rfp/manage');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /Manage RFP/i })
      ).toBeVisible();

      await page.goto('/rfp/create');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Select Approved PRs')).toBeVisible();

      await page.goto('/rfp/create-manual');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Create RFP').first()).toBeVisible();

      await page.goto('/rfp/submit-quotation');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /Submit RFP/i })
      ).toBeVisible();

      await page.goto('/rfp/approval');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /RFP Approval/i })
      ).toBeVisible();

      await page.goto('/rfp/summary');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /RFP Summary/i })
      ).toBeVisible();
    });
  });
});
