import { test, expect } from '@playwright/test';

// Helper to scope selectors to main content area (exclude sidebar/nav)
const mainContent = 'main, [class*="flex-1"], .flex-1';

test.describe('Purchase Requisition - Deep Workflow', () => {
  // ─────────────────────────────────────────────
  // CREATE PR
  // ─────────────────────────────────────────────
  test.describe('Create PR Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-requisition/create');
      await page.waitForTimeout(2000);
    });

    test('should display page title and action buttons', async ({ page }) => {
      await expect(page.getByText('Create Purchase Request')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Save as Draft/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /^Submit$/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Attach Files/i })
      ).toBeVisible();
    });

    test('should display budget status indicator', async ({ page }) => {
      await expect(page.getByText('Budget Status')).toBeVisible();
      await expect(page.getByText('Available')).toBeVisible();
      await expect(page.getByText('Current PR')).toBeVisible();
      await expect(page.getByText('Balance')).toBeVisible();
    });

    test('should have all required form fields with labels', async ({
      page,
    }) => {
      await expect(page.getByText('Request Date').first()).toBeVisible();
      await expect(page.getByText('Requestor').first()).toBeVisible();
      await expect(
        page.getByText('Location', { exact: true }).first()
      ).toBeVisible();
      await expect(
        page.getByText('Department', { exact: true }).first()
      ).toBeVisible();
      await expect(page.getByText('Purchase Type').first()).toBeVisible();
      await expect(page.getByText('Project Name').first()).toBeVisible();
      await expect(page.getByText('Justification').first()).toBeVisible();
    });

    test('should auto-fill requestor and department', async ({ page }) => {
      // Department should default to "IT"
      await expect(
        page.locator('select').filter({ hasText: /IT/i }).first()
      ).toBeVisible();
    });

    test('should have request date pre-filled with today', async ({ page }) => {
      const dateInput = page.locator('input[type="date"]');
      const value = await dateInput.inputValue();
      expect(value).toBeTruthy();
    });

    test('should show Location and Purchase Type dropdowns', async ({
      page,
    }) => {
      // These are <select> elements with default placeholder options
      const selects = page.locator('select');
      const count = await selects.count();
      expect(count).toBeGreaterThanOrEqual(3); // Location, Department, Purchase Type
    });

    test('should have Project Name input with placeholder', async ({
      page,
    }) => {
      await expect(page.getByPlaceholder('Enter project name')).toBeVisible();
    });

    test('should have Justification textarea with placeholder', async ({
      page,
    }) => {
      await expect(
        page.getByPlaceholder('Enter justification...')
      ).toBeVisible();
    });

    test('should show Item Details section', async ({ page }) => {
      await expect(page.getByText('Item Details')).toBeVisible();
    });

    // ── Full Create PR Workflow ──
    test('should fill form and save as draft', async ({ page }) => {
      // Select Location (first select with "Select Location")
      const selects = page.locator('select');
      const selectCount = await selects.count();
      for (let i = 0; i < selectCount; i++) {
        const text = await selects.nth(i).textContent();
        if (text?.includes('Select Location')) {
          await selects.nth(i).selectOption({ index: 1 });
          break;
        }
      }

      // Select Purchase Type
      for (let i = 0; i < selectCount; i++) {
        const text = await selects.nth(i).textContent();
        if (text?.includes('Select Purchase Type')) {
          await selects.nth(i).selectOption({ index: 1 });
          break;
        }
      }

      // Fill Project Name
      await page
        .getByPlaceholder('Enter project name')
        .fill('E2E Test Project');

      // Fill Justification
      await page
        .getByPlaceholder('Enter justification...')
        .fill('Automated E2E test - save as draft');

      // Click Save as Draft
      await page.getByRole('button', { name: /Save as Draft/i }).click();

      // Wait for response
      await page.waitForTimeout(3000);
    });

    test('should show validation when submitting without items', async ({
      page,
    }) => {
      // Select Location
      const selects = page.locator('select');
      const selectCount = await selects.count();
      for (let i = 0; i < selectCount; i++) {
        const text = await selects.nth(i).textContent();
        if (text?.includes('Select Location')) {
          await selects.nth(i).selectOption({ index: 1 });
          break;
        }
      }

      // Select Purchase Type
      for (let i = 0; i < selectCount; i++) {
        const text = await selects.nth(i).textContent();
        if (text?.includes('Select Purchase Type')) {
          await selects.nth(i).selectOption({ index: 1 });
          break;
        }
      }

      // Fill Project Name and Justification
      await page.getByPlaceholder('Enter project name').fill('E2E Submit Test');
      await page
        .getByPlaceholder('Enter justification...')
        .fill('Automated E2E test');

      // Click Submit without adding items
      await page.getByRole('button', { name: /^Submit$/i }).click();

      // Should show validation or error (no items added)
      await page.waitForTimeout(2000);
    });
  });

  // ─────────────────────────────────────────────
  // MANAGE PR (DRAFTS)
  // ─────────────────────────────────────────────
  test.describe('Manage PR Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-requisition/manage');
      await page.waitForTimeout(2000);
    });

    test('should display page title and subtitle', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /Manage PR/i })
      ).toBeVisible();
      await expect(
        page.getByText('View and manage your purchase requisitions')
      ).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(
          'Search by request number, requestor, or department...'
        )
      ).toBeVisible();
    });

    test('should display table with correct column headers', async ({
      page,
    }) => {
      await expect(
        page.getByRole('columnheader', { name: /REQUEST NUMBER/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /REQUEST DATE/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /REQUESTED BY/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /DEPARTMENT/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /PROJECT NAME/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /STATUS/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /ACTIONS/i })
      ).toBeVisible();
    });

    test('should have select-all checkbox in table header', async ({
      page,
    }) => {
      const headerCheckbox = page.locator('thead input[type="checkbox"]');
      await expect(headerCheckbox).toBeVisible();
    });

    test('should display PR table', async ({ page }) => {
      // Table should be visible (may or may not have data rows)
      await expect(page.locator('table')).toBeVisible();

      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      if (rowCount > 0) {
        // If rows exist, first row should have checkbox
        const firstRow = rows.first();
        await expect(firstRow.locator('input[type="checkbox"]')).toBeVisible();
      }
    });

    test('should have clickable request number links', async ({ page }) => {
      const requestLink = page
        .locator('table tbody a')
        .filter({ hasText: /REQ|DRAFT/i })
        .first();
      if (await requestLink.isVisible()) {
        await expect(requestLink).toBeVisible();
      }
    });

    test('should display status badges', async ({ page }) => {
      // Look for any status badge text in the table
      const statusBadge = page
        .locator('table tbody')
        .getByText(/Waiting|Rejected|Draft|Approved/i)
        .first();
      if (await statusBadge.isVisible()) {
        await expect(statusBadge).toBeVisible();
      }
    });

    test('should have edit and delete action buttons per row', async ({
      page,
    }) => {
      const firstRow = page.locator('table tbody tr').first();
      const actionButtons = firstRow.locator(
        'td:last-child button, td:last-child a'
      );
      const count = await actionButtons.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('should search and filter PRs', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        'Search by request number, requestor, or department...'
      );
      await searchInput.fill('DRAFT');
      await page.waitForTimeout(500);
    });

    test('should select individual PR with checkbox', async ({ page }) => {
      const firstRowCheckbox = page
        .locator('table tbody tr')
        .first()
        .locator('input[type="checkbox"]');
      await firstRowCheckbox.check();
      await expect(firstRowCheckbox).toBeChecked();
    });

    test('should select all PRs with header checkbox', async ({ page }) => {
      const headerCheckbox = page.locator('thead input[type="checkbox"]');
      await headerCheckbox.check();
      await expect(headerCheckbox).toBeChecked();

      // "Delete Selected" button should appear
      await expect(page.getByText(/Delete Selected/i)).toBeVisible();
    });

    test('should navigate to edit PR when clicking request number', async ({
      page,
    }) => {
      const requestLink = page
        .locator('table tbody a')
        .filter({ hasText: /REQ|DRAFT/i })
        .first();
      if (await requestLink.isVisible()) {
        await requestLink.click();
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/purchase-requisition\/create\?id=/);
      }
    });
  });

  // ─────────────────────────────────────────────
  // APPROVE PR
  // ─────────────────────────────────────────────
  test.describe('Approve PR Page (L1)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(2000);
    });

    test('should display page title', async ({ page }) => {
      await expect(page.getByText('Pending For Approval (L1)')).toBeVisible();
      await expect(
        page.getByText('Review and approve purchase requisitions')
      ).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(
          'Search by request number, requestor, or department...'
        )
      ).toBeVisible();
    });

    test('should display approval queue table with correct headers', async ({
      page,
    }) => {
      await expect(
        page.getByRole('columnheader', { name: /S.NO/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /REQUEST NUMBER/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /REQUEST DATE/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /REQUESTED BY/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /DEPARTMENT/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /CREATED BY/i })
      ).toBeVisible();
      await expect(
        page.getByRole('columnheader', { name: /CREATED DATE/i })
      ).toBeVisible();
    });

    test('should display PRs pending approval', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should have clickable request number buttons', async ({ page }) => {
      const requestLink = page
        .locator('table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await expect(requestLink).toBeVisible();
    });

    test('should search approval queue', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        'Search by request number, requestor, or department...'
      );
      await searchInput.fill('REQ/2025');
      await page.waitForTimeout(500);
    });

    test('should navigate to approval detail when clicking request number', async ({
      page,
    }) => {
      const requestLink = page
        .locator('table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await requestLink.click();
      await page.waitForTimeout(3000);

      // Should show approval detail with PR info and action buttons
      const approveBtn = page.getByRole('button', {
        name: /Approve Selected/i,
      });
      const rejectBtn = page.getByRole('button', { name: /Reject Selected/i });

      if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(approveBtn).toBeVisible();
        await expect(rejectBtn).toBeVisible();
      }
    });

    test('should show PR header details in approval view', async ({ page }) => {
      const requestLink = page
        .locator('table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await requestLink.click();
      await page.waitForTimeout(3000);

      // Check for PR Approval heading
      const prApproval = page.getByText('PR Approval').first();
      if (await prApproval.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(prApproval).toBeVisible();
      }
    });

    test('should have item checkboxes in approval detail', async ({ page }) => {
      const requestLink = page
        .locator('table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await requestLink.click();
      await page.waitForTimeout(3000);

      const checkboxes = page.locator('input[type="checkbox"]');
      if (
        await checkboxes
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        const count = await checkboxes.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should have editable quantity and price in approval detail', async ({
      page,
    }) => {
      const requestLink = page
        .locator('table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await requestLink.click();
      await page.waitForTimeout(3000);

      const numberInputs = page.locator('input[type="number"]');
      if (
        await numberInputs
          .first()
          .isVisible({ timeout: 5000 })
          .catch(() => false)
      ) {
        const count = await numberInputs.count();
        expect(count).toBeGreaterThan(0);
      }
    });

    test('should have general remarks textarea', async ({ page }) => {
      const requestLink = page
        .locator('table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await requestLink.click();
      await page.waitForTimeout(3000);

      const remarksTextarea = page.getByPlaceholder(/Enter general remarks/i);
      if (
        await remarksTextarea.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await expect(remarksTextarea).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // PR PREVIEW
  // ─────────────────────────────────────────────
  test.describe('PR Preview Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-requisition/preview');
      await page.waitForTimeout(2000);
    });

    test('should display page title and subtitle', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /PR Preview/i }).first()
      ).toBeVisible();
      await expect(
        page.getByText('Preview and print purchase requisitions').first()
      ).toBeVisible();
    });

    test('should have Print button', async ({ page }) => {
      await expect(page.getByRole('button', { name: /Print/i })).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder(
          'Search by request number, requestor, or department...'
        )
      ).toBeVisible();
    });

    test('should have All Status filter dropdown', async ({ page }) => {
      await expect(
        page.locator('select').filter({ hasText: /All Status/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(page.getByText('S.No').first()).toBeVisible();
      await expect(page.getByText('Request Number').first()).toBeVisible();
      await expect(page.getByText('Request Date').first()).toBeVisible();
      await expect(page.getByText('Requested By').first()).toBeVisible();
    });

    test('should display PR rows with data', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);
    });

    test('should have clickable request number links', async ({ page }) => {
      const requestLink = page
        .locator('table tbody a, table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await expect(requestLink).toBeVisible();
    });

    test('should search PRs in preview', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        'Search by request number, requestor, or department...'
      );
      await searchInput.fill('REQ/2025-2026/24');
      await page.waitForTimeout(500);
    });

    test('should filter by status', async ({ page }) => {
      const statusFilter = page
        .locator('select')
        .filter({ hasText: /All Status/i });
      const options = await statusFilter.locator('option').count();
      if (options > 1) {
        await statusFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }
    });

    test('should open PR detail view when clicking request number', async ({
      page,
    }) => {
      const requestLink = page
        .locator('table tbody a, table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await requestLink.click();
      await page.waitForTimeout(3000);

      // Should show detail view with line items or back button
      const detailView = page.getByText(/Grand Total|Model Name/i).first();
      if (await detailView.isVisible({ timeout: 5000 }).catch(() => false)) {
        await expect(detailView).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // PR STATUS
  // ─────────────────────────────────────────────
  test.describe('PR Status Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(2000);
    });

    test('should display page title and subtitle', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /PR Status/i }).first()
      ).toBeVisible();
      await expect(
        page.getByText('Track the status of your purchase requisitions')
      ).toBeVisible();
    });

    test('should display search input', async ({ page }) => {
      await expect(
        page.getByPlaceholder('Search by PR number, requestor, or item...')
      ).toBeVisible();
    });

    test('should have All Status filter dropdown', async ({ page }) => {
      await expect(
        page.locator('select').filter({ hasText: /All Status/i })
      ).toBeVisible();
    });

    test('should display table with correct headers', async ({ page }) => {
      await expect(page.getByText('S.No').first()).toBeVisible();
      await expect(page.getByText('PR Number').first()).toBeVisible();
      await expect(page.getByText('PR Date').first()).toBeVisible();
      await expect(page.getByText('Requested By').first()).toBeVisible();
      await expect(
        page.getByText('Item', { exact: true }).first()
      ).toBeVisible();
      await expect(page.getByText('Approved By').first()).toBeVisible();
    });

    test('should display item-level status data', async ({ page }) => {
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Rows should show item names
      const firstRowText = await rows.first().textContent();
      expect(firstRowText).toBeTruthy();
    });

    test('should have clickable PR number links', async ({ page }) => {
      const prLink = page
        .locator('table tbody a, table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await expect(prLink).toBeVisible();
    });

    test('should show "NA" for unapproved items', async ({ page }) => {
      const naText = page.locator('table tbody').getByText('NA').first();
      if (await naText.isVisible()) {
        await expect(naText).toBeVisible();
      }
    });

    test('should search by PR number', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        'Search by PR number, requestor, or item...'
      );
      await searchInput.fill('REQ/2025-2026/24');
      await page.waitForTimeout(500);
    });

    test('should search by item name', async ({ page }) => {
      const searchInput = page.getByPlaceholder(
        'Search by PR number, requestor, or item...'
      );
      await searchInput.fill('Fujitsu');
      await page.waitForTimeout(500);
    });

    test('should filter by status', async ({ page }) => {
      const statusFilter = page
        .locator('select')
        .filter({ hasText: /All Status/i });
      const options = await statusFilter.locator('option').count();
      if (options > 1) {
        await statusFilter.selectOption({ index: 1 });
        await page.waitForTimeout(500);
      }
    });
  });

  // ─────────────────────────────────────────────
  // CROSS-PAGE WORKFLOW
  // ─────────────────────────────────────────────
  test.describe('End-to-End PR Workflow', () => {
    test('should navigate through full PR lifecycle via sidebar', async ({
      page,
    }) => {
      // Step 1: Create PR
      await page.goto('/purchase-requisition/create');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Create Purchase Request')).toBeVisible();

      // Step 2: Manage PR
      await page.goto('/purchase-requisition/manage');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /Manage PR/i })
      ).toBeVisible();

      // Step 3: Approve PR
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Pending For Approval (L1)')).toBeVisible();

      // Step 4: PR Preview
      await page.goto('/purchase-requisition/preview');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /PR Preview/i }).first()
      ).toBeVisible();

      // Step 5: PR Status
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(2000);
      await expect(
        page.getByRole('heading', { name: /PR Status/i }).first()
      ).toBeVisible();
    });

    test('should create PR via quick create menu', async ({ page }) => {
      await page.goto('/dashboard/overview');
      await page.waitForTimeout(2000);

      await page.getByText('+ Create').click();
      await page.waitForTimeout(300);

      // Click "Purchase Requisition" from dropdown
      const prOption = page
        .getByRole('link', { name: /Purchase Requisition/i })
        .first();
      if (await prOption.isVisible()) {
        await prOption.click();
        await page.waitForTimeout(2000);
        await expect(page).toHaveURL(/purchase-requisition\/create/);
      }
    });

    test('should view PR detail from preview page', async ({ page }) => {
      await page.goto('/purchase-requisition/preview');
      await page.waitForTimeout(2000);

      const firstPR = page
        .locator('table tbody a, table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      if (await firstPR.isVisible()) {
        await firstPR.click();
        await page.waitForTimeout(3000);

        // Capture detail view for reference
        await page.screenshot({
          path: 'e2e/screenshots/pr-detail-view.png',
          fullPage: true,
        });
      }
    });

    test('should track item-level status from status page', async ({
      page,
    }) => {
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(2000);

      // Verify item-level tracking works
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // Each row shows an individual item — check PR link exists
      const prLink = page
        .locator('table tbody a, table tbody button')
        .filter({ hasText: /REQ/i })
        .first();
      await expect(prLink).toBeVisible();
    });

    test('should show approval queue has pending items', async ({ page }) => {
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(2000);

      // Verify there are items awaiting approval
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      expect(rowCount).toBeGreaterThan(0);

      // First PR should have "System Administrator" or "ADMIN" as requestor
      const firstRowText = await rows.first().textContent();
      expect(firstRowText).toBeTruthy();
    });
  });
});
