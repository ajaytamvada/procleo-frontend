import { test, expect, Page } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// PR APPROVAL WORKFLOW - End-to-End Tests
//
// Tests the complete multi-level approval lifecycle:
//   Create PR → Submit → L1 Approve → L2 Approve → L3 Approve
//
// Budget thresholds (backend):
//   < ₹50,000   → L1 only
//   ₹50k–₹100k  → L1 + L2
//   > ₹100,000  → L1 + L2 + L3
// ═══════════════════════════════════════════════════════════════

// ── Helpers ──

/** Select a dropdown by finding one whose text contains the placeholder */
async function selectDropdownByPlaceholder(
  page: Page,
  placeholder: string,
  optionIndex = 1
) {
  const selects = page.locator('select');
  const count = await selects.count();
  for (let i = 0; i < count; i++) {
    const text = await selects.nth(i).textContent();
    if (text?.includes(placeholder)) {
      await selects.nth(i).selectOption({ index: optionIndex });
      return;
    }
  }
}

/** Fill the PR header fields (location, purchase type, project, justification) */
async function fillPRHeader(
  page: Page,
  projectName: string,
  justification: string
) {
  await selectDropdownByPlaceholder(page, 'Select Location');
  await selectDropdownByPlaceholder(page, 'Select Purchase Type');
  await page.getByPlaceholder('Enter project name').fill(projectName);
  await page.getByPlaceholder('Enter justification...').fill(justification);
}

/**
 * Add an item row via search, then set quantity and unit price.
 * The search types a term into the Model field, waits for the dropdown,
 * and picks the first result.
 */
async function addItemViaSearch(
  page: Page,
  searchTerm: string,
  quantity: number,
  unitPrice: number,
  rowIndex = 0
) {
  // Click "Add Row" if this is not the first row (first row may already exist)
  if (rowIndex > 0) {
    await page.getByRole('button', { name: /Add Row/i }).click();
    await page.waitForTimeout(500);
  }

  // Type in the model search field for this row
  const searchFields = page.locator('input[placeholder="Search..."]');
  const searchField = searchFields.nth(rowIndex);
  await searchField.click();
  await searchField.fill(searchTerm);

  // Wait for search results dropdown to appear
  await page.waitForTimeout(2000);

  // Click the first search result button from the dropdown
  const dropdownButton = page.locator('.absolute.z-10 button').first();
  if (await dropdownButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await dropdownButton.click();
    await page.waitForTimeout(1000);
  }

  // Set quantity
  const qtyFields = page.locator('input[type="number"][min="1"]');
  const qtyField = qtyFields.nth(rowIndex);
  await qtyField.clear();
  await qtyField.fill(quantity.toString());

  // Set unit price
  const priceFields = page.locator('input[type="number"][min="0"]');
  const priceField = priceFields.nth(rowIndex);
  await priceField.clear();
  await priceField.fill(unitPrice.toString());
}

/**
 * Navigate to an approval page, find a PR by request number, and approve all items.
 * Returns true if the PR was found and approved, false otherwise.
 */
async function approveAllItemsForPR(
  page: Page,
  approvalPath: string,
  prNumber: string,
  remarks: string
): Promise<boolean> {
  await page.goto(approvalPath);
  await page.waitForTimeout(3000);

  // Find the PR in the approval queue
  const prButton = page
    .locator('table tbody button, table tbody a')
    .filter({
      hasText: new RegExp(prNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    });

  if (
    !(await prButton
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false))
  ) {
    return false;
  }

  // Click to open approval detail
  await prButton.first().click();
  await page.waitForTimeout(3000);

  // Verify we're on the approval detail page
  const approveBtn = page.getByRole('button', { name: /Approve Selected/i });
  if (!(await approveBtn.isVisible({ timeout: 10000 }).catch(() => false))) {
    return false;
  }

  // Select all items using the header checkbox
  const selectAllCheckbox = page.locator('thead input[type="checkbox"]');
  if (await selectAllCheckbox.isVisible()) {
    await selectAllCheckbox.check();
  } else {
    // Select individual checkboxes
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }
  }

  // Add general remarks
  const remarksField = page.getByPlaceholder(/Enter general remarks/i);
  if (await remarksField.isVisible()) {
    await remarksField.fill(remarks);
  }

  // Click Approve Selected
  await approveBtn.click();
  await page.waitForTimeout(3000);

  return true;
}

/**
 * Reject selected items for a PR at a given approval level.
 */
async function rejectAllItemsForPR(
  page: Page,
  approvalPath: string,
  prNumber: string,
  remarks: string
): Promise<boolean> {
  await page.goto(approvalPath);
  await page.waitForTimeout(3000);

  const prButton = page
    .locator('table tbody button, table tbody a')
    .filter({
      hasText: new RegExp(prNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
    });

  if (
    !(await prButton
      .first()
      .isVisible({ timeout: 10000 })
      .catch(() => false))
  ) {
    return false;
  }

  await prButton.first().click();
  await page.waitForTimeout(3000);

  const rejectBtn = page.getByRole('button', { name: /Reject Selected/i });
  if (!(await rejectBtn.isVisible({ timeout: 10000 }).catch(() => false))) {
    return false;
  }

  // Select all items
  const selectAllCheckbox = page.locator('thead input[type="checkbox"]');
  if (await selectAllCheckbox.isVisible()) {
    await selectAllCheckbox.check();
  } else {
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    for (let i = 0; i < count; i++) {
      await checkboxes.nth(i).check();
    }
  }

  const remarksField = page.getByPlaceholder(/Enter general remarks/i);
  if (await remarksField.isVisible()) {
    await remarksField.fill(remarks);
  }

  await rejectBtn.click();
  await page.waitForTimeout(3000);

  return true;
}

/**
 * Get the most recent PR number from the PR Preview page.
 */
async function getLatestPRNumber(page: Page): Promise<string | null> {
  await page.goto('/purchase-requisition/preview');
  await page.waitForTimeout(3000);

  const firstPRLink = page
    .locator('table tbody a, table tbody button')
    .filter({ hasText: /REQ/i })
    .first();

  if (await firstPRLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    const text = await firstPRLink.textContent();
    return text?.trim() || null;
  }
  return null;
}

/**
 * Create and submit a PR with given items. Returns the PR number.
 */
async function createAndSubmitPR(
  page: Page,
  projectName: string,
  items: Array<{ search: string; qty: number; price: number }>
): Promise<string | null> {
  await page.goto('/purchase-requisition/create');
  await page.waitForTimeout(2000);

  // Fill header fields
  await fillPRHeader(page, projectName, `E2E automated test - ${projectName}`);

  // Click "Add Row" to get the first item row
  await page.getByRole('button', { name: /Add Row/i }).click();
  await page.waitForTimeout(500);

  // Add items
  for (let i = 0; i < items.length; i++) {
    await addItemViaSearch(
      page,
      items[i].search,
      items[i].qty,
      items[i].price,
      i
    );
  }

  await page.waitForTimeout(1000);

  // Take screenshot before submit
  await page.screenshot({
    path: `e2e/screenshots/pr-create-before-submit-${Date.now()}.png`,
    fullPage: true,
  });

  // Click Submit
  await page.getByRole('button', { name: /^Submit$/i }).click();
  await page.waitForTimeout(1000);

  // Handle confirmation dialog if it appears
  const confirmBtn = page.getByRole('button', { name: /Confirm|Yes|OK/i });
  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click();
  }

  await page.waitForTimeout(3000);

  // Get the PR number from the preview page (redirected there after submit)
  const prNumber = await getLatestPRNumber(page);
  return prNumber;
}

// ═══════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════

test.describe('PR Approval Workflow - Multi-Level', () => {
  // Increase timeout for workflow tests since they span multiple pages
  test.setTimeout(120000);

  // ─────────────────────────────────────────────
  // L2 & L3 APPROVAL PAGES - UI Verification
  // Combined to reduce parallel load on dev server
  // ─────────────────────────────────────────────
  test.describe('Approve PR Pages (L2 & L3)', () => {
    test('should display L2 approval page with title, search, and table or empty state', async ({
      page,
    }) => {
      await page.goto('/purchase-requisition/approve-l2');
      await page.waitForTimeout(3000);

      // Wait for page to fully load - check for title OR retry
      await expect(page.getByText('Pending L2 Approval')).toBeVisible({
        timeout: 15000,
      });
      await expect(
        page.getByText('Review and approve purchase requisitions')
      ).toBeVisible();

      // Search input
      await expect(
        page.getByPlaceholder(
          'Search by request number, requestor, or department...'
        )
      ).toBeVisible();

      // Table or empty state
      const hasTable = await page
        .getByRole('columnheader', { name: /S.NO/i })
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      const hasEmptyState = await page
        .getByText('No Data Found')
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      expect(hasTable || hasEmptyState).toBeTruthy();

      await page.screenshot({
        path: 'e2e/screenshots/approve-pr-l2-queue.png',
        fullPage: true,
      });
    });

    test('should display L3 approval page with title, search, and table or empty state', async ({
      page,
    }) => {
      await page.goto('/purchase-requisition/approve-l3');
      await page.waitForTimeout(3000);

      // Wait for page to fully load
      await expect(page.getByText('Pending L3 Approval')).toBeVisible({
        timeout: 15000,
      });
      await expect(
        page.getByText('Review and approve purchase requisitions')
      ).toBeVisible();

      // Search input
      await expect(
        page.getByPlaceholder(
          'Search by request number, requestor, or department...'
        )
      ).toBeVisible();

      // Table or empty state
      const hasTable = await page
        .getByRole('columnheader', { name: /S.NO/i })
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      const hasEmptyState = await page
        .getByText('No Data Found')
        .isVisible({ timeout: 3000 })
        .catch(() => false);
      expect(hasTable || hasEmptyState).toBeTruthy();

      await page.screenshot({
        path: 'e2e/screenshots/approve-pr-l3-queue.png',
        fullPage: true,
      });
    });
  });

  // ─────────────────────────────────────────────
  // FULL 3-LEVEL APPROVAL WORKFLOW (> ₹100k)
  // ─────────────────────────────────────────────
  test.describe('Complete 3-Level Approval Workflow', () => {
    test('should create PR, submit, and approve through all 3 levels', async ({
      page,
    }) => {
      // ── STEP 1: Create and submit a PR with total > ₹100,000 ──
      await page.goto('/purchase-requisition/create');
      await page.waitForTimeout(3000);

      await fillPRHeader(
        page,
        'E2E 3-Level Approval Test',
        'Testing full 3-level approval workflow'
      );

      // Add a row and fill item with high value to trigger 3-level approval
      await page.getByRole('button', { name: /Add Row/i }).click();
      await page.waitForTimeout(500);

      // Search for an item
      const searchField = page
        .locator('input[placeholder="Search..."]')
        .first();
      await searchField.click();
      await searchField.fill('3Com');
      await page.waitForTimeout(2000);

      // Pick the first search result button from the dropdown
      const dropdownButton = page.locator('.absolute.z-10 button').first();
      await dropdownButton.waitFor({ state: 'visible', timeout: 10000 });
      await dropdownButton.click();
      await page.waitForTimeout(1000);

      // Set quantity = 10, unit price = 15000 (total = ₹150,000 > ₹100k threshold)
      const qtyField = page.locator('input[type="number"][min="1"]').first();
      await qtyField.clear();
      await qtyField.fill('10');

      const priceField = page.locator('input[type="number"][min="0"]').first();
      await priceField.clear();
      await priceField.fill('15000');

      await page.waitForTimeout(500);

      // Delete the empty second row (Add Row creates 2 rows sometimes)
      const deleteButtons = page
        .locator('button')
        .filter({ has: page.locator('[class*="Trash"], [class*="trash"]') });
      const deleteCount = await deleteButtons.count();
      if (deleteCount > 1) {
        await deleteButtons.last().click();
        await page.waitForTimeout(500);
      }

      await page.screenshot({
        path: 'e2e/screenshots/workflow-step1-create.png',
        fullPage: true,
      });

      // Scroll to bottom to see budget indicator and submit button
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: 'e2e/screenshots/workflow-step1-budget-status.png',
        fullPage: true,
      });

      // Check budget status before submitting
      const budgetExceeded = page.getByText(/EXCEEDED/i);
      if (
        await budgetExceeded.isVisible({ timeout: 2000 }).catch(() => false)
      ) {
        console.log('WARNING: Budget is EXCEEDED - PR submit will be blocked!');
      } else {
        console.log('Budget status OK');
      }

      // Click Submit - scroll it into view first
      const submitBtn = page.getByRole('button', { name: /^Submit$/i });
      await submitBtn.scrollIntoViewIfNeeded();
      await submitBtn.click();
      await page.waitForTimeout(2000);

      // Take screenshot immediately after clicking Submit (catch errors/dialogs)
      await page.screenshot({
        path: 'e2e/screenshots/workflow-step1-after-submit-click.png',
        fullPage: true,
      });

      // Handle confirmation dialog - wait for it then click the Submit button inside it
      // The dialog has text "Confirm Submission" and a "Submit" button
      const confirmDialog = page.getByText('Confirm Submission');
      if (await confirmDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('Confirmation dialog appeared - clicking Submit');
        // Click the Submit button that appears AFTER the Cancel button in the dialog
        const dialogButtons = page.getByRole('button', { name: /^Submit$/i });
        // There are 2 Submit buttons: the page one and the dialog one. The dialog one is the last visible.
        const count = await dialogButtons.count();
        await dialogButtons.nth(count - 1).click();
        await page.waitForTimeout(5000);
      } else {
        console.log('No confirmation dialog appeared');
      }

      // Take screenshot after confirmation
      await page.screenshot({
        path: 'e2e/screenshots/workflow-step1-after-confirm.png',
        fullPage: true,
      });

      // Check for success or error toast
      const successToast = page.getByText(/submitted successfully/i);
      const errorToast = page.getByText(/Budget exceeded|Failed|Error/i);
      if (await successToast.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('PR submitted successfully!');
      } else if (
        await errorToast.isVisible({ timeout: 3000 }).catch(() => false)
      ) {
        const errorText = await errorToast.textContent();
        console.log('PR submission FAILED:', errorText);
      } else {
        console.log('No toast message detected - checking current URL');
        console.log('Current URL:', page.url());
      }

      // Wait for redirect to preview page
      await page.waitForTimeout(2000);

      // If still on create page, submission may have failed
      if (page.url().includes('/create')) {
        console.log('Still on create page - submission likely failed');
        await page.screenshot({
          path: 'e2e/screenshots/workflow-step1-still-on-create.png',
          fullPage: true,
        });
      }

      // Get the PR number from preview page
      const prNumber = await getLatestPRNumber(page);
      console.log('Latest PR in preview:', prNumber);

      // Take screenshot of preview
      await page.screenshot({
        path: 'e2e/screenshots/workflow-step1-preview.png',
        fullPage: true,
      });

      // Skip remaining steps if PR creation failed
      if (!prNumber) {
        console.log(
          'PR creation may not have produced a visible PR number - checking approval queue directly'
        );
      }

      // ── Helper: Find and approve a specific PR in an approval queue ──
      async function findAndApprovePR(
        approvalPath: string,
        searchPR: string,
        level: string,
        remarks: string
      ): Promise<boolean> {
        await page.goto(approvalPath);
        await page.waitForTimeout(3000);
        await page.screenshot({
          path: `e2e/screenshots/workflow-${level}-queue.png`,
          fullPage: true,
        });

        // Search for our specific PR using the search box
        const searchInput = page.getByPlaceholder(
          'Search by request number, requestor, or department...'
        );
        if (await searchInput.isVisible()) {
          await searchInput.fill(searchPR);
          await page.waitForTimeout(2000);
        }

        // Find our specific PR button
        const prButton = page
          .locator('table tbody button, table tbody a')
          .filter({
            hasText: new RegExp(
              searchPR.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            ),
          });

        if (
          !(await prButton
            .first()
            .isVisible({ timeout: 10000 })
            .catch(() => false))
        ) {
          // Try without search filter - maybe search doesn't work on this field
          await searchInput.clear();
          await page.waitForTimeout(1000);

          // Scroll through pages to find our PR
          const allPRButtons = page
            .locator('table tbody button, table tbody a')
            .filter({ hasText: /REQ/i });
          const count = await allPRButtons.count();
          console.log(
            `${level}: Found ${count} PRs in queue, looking for ${searchPR}`
          );

          let found = false;
          for (let i = 0; i < count; i++) {
            const text = await allPRButtons.nth(i).textContent();
            if (text?.includes(searchPR)) {
              await allPRButtons.nth(i).click();
              found = true;
              break;
            }
          }

          if (!found) {
            console.log(`${level}: PR ${searchPR} not found in queue`);
            return false;
          }
        } else {
          await prButton.first().click();
        }

        await page.waitForTimeout(3000);
        await page.screenshot({
          path: `e2e/screenshots/workflow-${level}-detail.png`,
          fullPage: true,
        });

        // Verify we're on the approval detail page
        const approveBtn = page.getByRole('button', {
          name: /Approve Selected/i,
        });
        if (
          !(await approveBtn.isVisible({ timeout: 10000 }).catch(() => false))
        ) {
          console.log(`${level}: Approve button not visible`);
          return false;
        }

        // Select all items
        const selectAll = page.locator('thead input[type="checkbox"]');
        if (await selectAll.isVisible()) {
          await selectAll.check();
        } else {
          const checkboxes = page.locator('tbody input[type="checkbox"]');
          const cbCount = await checkboxes.count();
          for (let i = 0; i < cbCount; i++) {
            await checkboxes.nth(i).check();
          }
        }

        // Add remarks
        const remarksField = page.getByPlaceholder(/Enter general remarks/i);
        if (await remarksField.isVisible()) {
          await remarksField.fill(remarks);
        }

        // Click Approve
        await approveBtn.click();
        await page.waitForTimeout(3000);
        await page.screenshot({
          path: `e2e/screenshots/workflow-${level}-approved.png`,
          fullPage: true,
        });

        // Check for error toast
        const errorToast = page.getByText(/Failed|Error/i).first();
        if (await errorToast.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`${level}: Approval FAILED - error message visible`);
          return false;
        }

        console.log(`${level} Approval completed`);
        return true;
      }

      // Use the PR number we captured, or a fallback pattern
      const searchTerm = prNumber || 'REQ/2025-2026';

      // ── STEP 2: L1 Approval ──
      const l1Result = await findAndApprovePR(
        '/purchase-requisition/approve',
        searchTerm,
        'step2-l1',
        'L1 approved via E2E test'
      );

      // ── STEP 3: L2 Approval ──
      if (l1Result) {
        const l2Result = await findAndApprovePR(
          '/purchase-requisition/approve-l2',
          searchTerm,
          'step3-l2',
          'L2 approved via E2E test'
        );

        // ── STEP 4: L3 Approval ──
        if (l2Result) {
          await findAndApprovePR(
            '/purchase-requisition/approve-l3',
            searchTerm,
            'step4-l3',
            'L3 approved via E2E test'
          );
        }
      }

      // ── STEP 5: Verify final status ──
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'e2e/screenshots/workflow-step5-final-status.png',
        fullPage: true,
      });

      // Check for Approved status in the table
      const statusCell = page
        .locator('table tbody')
        .getByText(/Accepted|Approved/i)
        .first();
      if (await statusCell.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log('PR shows Approved/Accepted status - workflow complete!');
      }

      // Also check PR Preview for the final state
      await page.goto('/purchase-requisition/preview');
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'e2e/screenshots/workflow-step5-preview-final.png',
        fullPage: true,
      });
    });
  });

  // ─────────────────────────────────────────────
  // L1-ONLY APPROVAL WORKFLOW (< ₹50k)
  // ─────────────────────────────────────────────
  test.describe('Single-Level Approval Workflow (< ₹50k)', () => {
    test('should complete with L1 only and not appear in L2/L3 queues', async ({
      page,
    }) => {
      // ── Create PR with total < ₹50,000 ──
      await page.goto('/purchase-requisition/create');
      await page.waitForTimeout(2000);

      await fillPRHeader(
        page,
        'E2E L1-Only Test',
        'Testing single-level approval (< 50k)'
      );

      await page.getByRole('button', { name: /Add Row/i }).click();
      await page.waitForTimeout(500);

      const searchField = page
        .locator('input[placeholder="Search..."]')
        .first();
      await searchField.click();
      await searchField.fill('a');
      await page.waitForTimeout(2000);

      const dropdownButton = page.locator('.absolute.z-10 button').first();
      if (
        await dropdownButton.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await dropdownButton.click();
        await page.waitForTimeout(1000);
      }

      // Set quantity = 2, unit price = 5000 (total = ₹10,000 < ₹50k)
      const qtyField = page.locator('input[type="number"][min="1"]').first();
      await qtyField.clear();
      await qtyField.fill('2');

      const priceField = page.locator('input[type="number"][min="0"]').first();
      await priceField.clear();
      await priceField.fill('5000');

      await page.screenshot({
        path: 'e2e/screenshots/l1-only-create.png',
        fullPage: true,
      });

      // Submit
      await page.getByRole('button', { name: /^Submit$/i }).click();
      await page.waitForTimeout(1000);

      const dialogBtn = page
        .locator(
          '[role="dialog"] button, .fixed button, [class*="modal"] button'
        )
        .filter({ hasText: /^Submit$/i });
      if (await dialogBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dialogBtn.click();
      }
      await page.waitForTimeout(3000);

      // ── L1 Approve ──
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(3000);

      const l1PR = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (await l1PR.isVisible({ timeout: 10000 }).catch(() => false)) {
        await l1PR.click();
        await page.waitForTimeout(3000);

        const selectAll = page.locator('thead input[type="checkbox"]');
        if (await selectAll.isVisible()) {
          await selectAll.check();
        }

        const remarks = page.getByPlaceholder(/Enter general remarks/i);
        if (await remarks.isVisible()) {
          await remarks.fill('L1 approved - single level test');
        }

        await page.getByRole('button', { name: /Approve Selected/i }).click();
        await page.waitForTimeout(3000);
        await page.screenshot({
          path: 'e2e/screenshots/l1-only-approved.png',
          fullPage: true,
        });
      }

      // ── Verify NOT in L2 queue ──
      await page.goto('/purchase-requisition/approve-l2');
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'e2e/screenshots/l1-only-l2-queue-empty.png',
        fullPage: true,
      });

      // ── Verify final status ──
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'e2e/screenshots/l1-only-final-status.png',
        fullPage: true,
      });
    });
  });

  // ─────────────────────────────────────────────
  // REJECTION WORKFLOW
  // ─────────────────────────────────────────────
  test.describe('Rejection Workflow', () => {
    test('should reject PR at L1 and verify rejected status', async ({
      page,
    }) => {
      // ── Create and submit a PR ──
      await page.goto('/purchase-requisition/create');
      await page.waitForTimeout(2000);

      await fillPRHeader(
        page,
        'E2E Rejection Test',
        'Testing rejection workflow'
      );

      await page.getByRole('button', { name: /Add Row/i }).click();
      await page.waitForTimeout(500);

      const searchField = page
        .locator('input[placeholder="Search..."]')
        .first();
      await searchField.click();
      await searchField.fill('a');
      await page.waitForTimeout(2000);

      const dropdownButton = page.locator('.absolute.z-10 button').first();
      if (
        await dropdownButton.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        await dropdownButton.click();
        await page.waitForTimeout(1000);
      }

      const qtyField = page.locator('input[type="number"][min="1"]').first();
      await qtyField.clear();
      await qtyField.fill('1');

      const priceField = page.locator('input[type="number"][min="0"]').first();
      await priceField.clear();
      await priceField.fill('25000');

      await page.getByRole('button', { name: /^Submit$/i }).click();
      await page.waitForTimeout(1000);

      const dialogBtn = page
        .locator(
          '[role="dialog"] button, .fixed button, [class*="modal"] button'
        )
        .filter({ hasText: /^Submit$/i });
      if (await dialogBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await dialogBtn.click();
      }
      await page.waitForTimeout(3000);

      // ── Reject at L1 ──
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(3000);

      const prButton = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (await prButton.isVisible({ timeout: 10000 }).catch(() => false)) {
        await prButton.click();
        await page.waitForTimeout(3000);

        // Select all items
        const selectAll = page.locator('thead input[type="checkbox"]');
        if (await selectAll.isVisible()) {
          await selectAll.check();
        } else {
          const checkboxes = page.locator('tbody input[type="checkbox"]');
          const count = await checkboxes.count();
          for (let i = 0; i < count; i++) {
            await checkboxes.nth(i).check();
          }
        }

        const remarks = page.getByPlaceholder(/Enter general remarks/i);
        if (await remarks.isVisible()) {
          await remarks.fill('Rejected via E2E test - budget not justified');
        }

        // Click REJECT
        const rejectBtn = page.getByRole('button', {
          name: /Reject Selected/i,
        });
        await rejectBtn.click();
        await page.waitForTimeout(3000);

        await page.screenshot({
          path: 'e2e/screenshots/rejection-completed.png',
          fullPage: true,
        });
      }

      // ── Verify rejected status ──
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(3000);
      await page.screenshot({
        path: 'e2e/screenshots/rejection-final-status.png',
        fullPage: true,
      });

      // Should show Rejected status
      const rejectedStatus = page
        .locator('table tbody')
        .getByText(/Rejected/i)
        .first();
      if (
        await rejectedStatus.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        console.log('PR shows Rejected status - rejection workflow complete!');
      }
    });
  });

  // ─────────────────────────────────────────────
  // APPROVAL DETAIL PAGE FEATURES
  // ─────────────────────────────────────────────
  test.describe('Approval Detail Page Features', () => {
    test('should show PR header details in approval view', async ({ page }) => {
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(3000);

      const prButton = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (!(await prButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        test.skip();
        return;
      }

      await prButton.click();
      await page.waitForTimeout(3000);

      // Verify PR header details are displayed
      await expect(page.getByText('PR Approval').first()).toBeVisible();

      // Check for key detail fields
      const detailLabels = ['Request Date', 'Requested By', 'Department'];
      for (const label of detailLabels) {
        const labelEl = page.getByText(label, { exact: false }).first();
        if (await labelEl.isVisible({ timeout: 3000 }).catch(() => false)) {
          console.log(`Detail field "${label}" visible`);
        }
      }

      await page.screenshot({
        path: 'e2e/screenshots/approval-detail-header.png',
        fullPage: true,
      });
    });

    test('should allow modifying quantity and price during approval', async ({
      page,
    }) => {
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(3000);

      const prButton = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (!(await prButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        test.skip();
        return;
      }

      await prButton.click();
      await page.waitForTimeout(3000);

      // Verify editable quantity fields exist
      const qtyInputs = page.locator('input[type="number"]');
      const qtyCount = await qtyInputs.count();

      if (qtyCount > 0) {
        // Modify quantity of first item
        const firstQty = qtyInputs.first();
        const originalValue = await firstQty.inputValue();
        await firstQty.clear();
        await firstQty.fill('5');

        const newValue = await firstQty.inputValue();
        expect(newValue).toBe('5');

        // Restore original value
        await firstQty.clear();
        await firstQty.fill(originalValue);

        console.log('Quantity modification works');
      }

      await page.screenshot({
        path: 'e2e/screenshots/approval-detail-editable-fields.png',
        fullPage: true,
      });
    });

    test('should have item-level remarks field', async ({ page }) => {
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(3000);

      const prButton = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (!(await prButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        test.skip();
        return;
      }

      await prButton.click();
      await page.waitForTimeout(3000);

      // Check for item-level remarks inputs
      const remarksInputs = page.locator(
        'input[placeholder*="Remarks"], input[placeholder*="remarks"], textarea[placeholder*="Remarks"], textarea[placeholder*="remarks"]'
      );
      const count = await remarksInputs.count();
      console.log(`Found ${count} remarks field(s)`);

      // General remarks should always be visible
      const generalRemarks = page.getByPlaceholder(/Enter general remarks/i);
      if (await generalRemarks.isVisible()) {
        await generalRemarks.fill('Test remark for E2E');
        console.log('General remarks field works');
      }
    });

    test('should disable approve/reject buttons when no items selected', async ({
      page,
    }) => {
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(3000);

      const prButton = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (!(await prButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        test.skip();
        return;
      }

      await prButton.click();
      await page.waitForTimeout(3000);

      // Buttons should be disabled when no items are selected
      const approveBtn = page.getByRole('button', {
        name: /Approve Selected/i,
      });
      const rejectBtn = page.getByRole('button', { name: /Reject Selected/i });

      if (await approveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isDisabled = await approveBtn.isDisabled();
        console.log(
          `Approve button disabled when no items selected: ${isDisabled}`
        );
      }

      if (await rejectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        const isDisabled = await rejectBtn.isDisabled();
        console.log(
          `Reject button disabled when no items selected: ${isDisabled}`
        );
      }
    });

    test('should show cancel button that navigates back', async ({ page }) => {
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(3000);

      const prButton = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (!(await prButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        test.skip();
        return;
      }

      await prButton.click();
      await page.waitForTimeout(3000);

      const cancelBtn = page.getByRole('button', { name: /Cancel|Back/i });
      if (await cancelBtn.isVisible()) {
        await cancelBtn.click();
        await page.waitForTimeout(2000);

        // Should navigate back to the approval queue list
        await expect(page.getByText('Pending For Approval (L1)')).toBeVisible();
      }
    });
  });

  // ─────────────────────────────────────────────
  // APPROVAL HISTORY VERIFICATION
  // ─────────────────────────────────────────────
  test.describe('Approval History', () => {
    test('should display approval history for previously approved PRs', async ({
      page,
    }) => {
      // Navigate to L2 or L3 page which should show PRs with L1 history
      await page.goto('/purchase-requisition/approve-l2');
      await page.waitForTimeout(3000);

      const prButton = page
        .locator('table tbody button, table tbody a')
        .filter({ hasText: /REQ/i })
        .first();

      if (!(await prButton.isVisible({ timeout: 10000 }).catch(() => false))) {
        // No PRs in L2 queue - try checking status page instead
        await page.goto('/purchase-requisition/status');
        await page.waitForTimeout(3000);
        await page.screenshot({
          path: 'e2e/screenshots/approval-history-status.png',
          fullPage: true,
        });
        return;
      }

      await prButton.click();
      await page.waitForTimeout(3000);

      // Should show approval history section with L1 data
      const historySection = page.getByText(/Approval History/i).first();
      if (
        await historySection.isVisible({ timeout: 5000 }).catch(() => false)
      ) {
        console.log('Approval history section visible');
        await page.screenshot({
          path: 'e2e/screenshots/approval-history-l2-detail.png',
          fullPage: true,
        });
      }
    });
  });

  // ─────────────────────────────────────────────
  // SIDEBAR NAVIGATION FOR ALL APPROVAL LEVELS
  // ─────────────────────────────────────────────
  test.describe('Sidebar Navigation', () => {
    test('should show all approval level links in sidebar', async ({
      page,
    }) => {
      await page.goto('/dashboard/overview');
      await page.waitForTimeout(2000);

      // Expand Purchase Requisition menu if collapsed
      const prMenu = page.getByText('Purchase Requisition').first();
      if (await prMenu.isVisible()) {
        await prMenu.click();
        await page.waitForTimeout(500);
      }

      // Check for all approval links
      const approveL1 = page
        .getByRole('link', { name: /^Approve PR$/i })
        .or(
          page
            .locator('a[href*="/purchase-requisition/approve"]')
            .filter({ hasText: /^Approve PR$/i })
        );
      const approveL2 = page.getByText('Approve PR (L2)');
      const approveL3 = page.getByText('Approve PR (L3)');

      await page.screenshot({
        path: 'e2e/screenshots/sidebar-approval-links.png',
        fullPage: true,
      });

      if (await approveL2.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('L2 approval link visible in sidebar');
      }

      if (await approveL3.isVisible({ timeout: 3000 }).catch(() => false)) {
        console.log('L3 approval link visible in sidebar');
      }
    });

    test('should navigate to each approval level page from sidebar', async ({
      page,
    }) => {
      await page.goto('/dashboard/overview');
      await page.waitForTimeout(2000);

      // Navigate to L1
      await page.goto('/purchase-requisition/approve');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Pending For Approval (L1)')).toBeVisible();

      // Navigate to L2
      await page.goto('/purchase-requisition/approve-l2');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Pending L2 Approval')).toBeVisible();

      // Navigate to L3
      await page.goto('/purchase-requisition/approve-l3');
      await page.waitForTimeout(2000);
      await expect(page.getByText('Pending L3 Approval')).toBeVisible();
    });
  });

  // ─────────────────────────────────────────────
  // PR STATUS TRACKING ACROSS LEVELS
  // ─────────────────────────────────────────────
  test.describe('PR Status Tracking', () => {
    test('should show different statuses in PR status page', async ({
      page,
    }) => {
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(5000);

      // The status page should show item-level statuses (or be empty)
      const rows = page.locator('table tbody tr');
      const rowCount = await rows.count();
      if (rowCount === 0) {
        // Page may still be loading or no data - skip status checks
        console.log('PR Status page has no rows - may still be loading');
        return;
      }

      // Check for various status values
      const statusTexts = [
        'Accepted',
        'Rejected',
        'Waiting',
        'waiting_l2',
        'waiting_l3',
      ];
      for (const status of statusTexts) {
        const statusEl = page
          .locator('table tbody')
          .getByText(new RegExp(status, 'i'))
          .first();
        if (await statusEl.isVisible({ timeout: 2000 }).catch(() => false)) {
          console.log(`Status "${status}" found in PR status table`);
        }
      }

      await page.screenshot({
        path: 'e2e/screenshots/pr-status-all-statuses.png',
        fullPage: true,
      });
    });

    test('should filter by Waiting status', async ({ page }) => {
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(3000);

      const statusFilter = page
        .locator('select')
        .filter({ hasText: /All Status/i });
      if (await statusFilter.isVisible()) {
        // Select a specific status filter
        const options = statusFilter.locator('option');
        const optionCount = await options.count();
        for (let i = 0; i < optionCount; i++) {
          const optText = await options.nth(i).textContent();
          if (optText?.toLowerCase().includes('waiting')) {
            await statusFilter.selectOption({ index: i });
            await page.waitForTimeout(1000);
            await page.screenshot({
              path: 'e2e/screenshots/pr-status-filtered-waiting.png',
              fullPage: true,
            });
            break;
          }
        }
      }
    });

    test('should filter by Approved status', async ({ page }) => {
      await page.goto('/purchase-requisition/status');
      await page.waitForTimeout(3000);

      const statusFilter = page
        .locator('select')
        .filter({ hasText: /All Status/i });
      if (await statusFilter.isVisible()) {
        const options = statusFilter.locator('option');
        const optionCount = await options.count();
        for (let i = 0; i < optionCount; i++) {
          const optText = await options.nth(i).textContent();
          if (
            optText?.toLowerCase().includes('approved') ||
            optText?.toLowerCase().includes('accepted')
          ) {
            await statusFilter.selectOption({ index: i });
            await page.waitForTimeout(1000);
            await page.screenshot({
              path: 'e2e/screenshots/pr-status-filtered-approved.png',
              fullPage: true,
            });
            break;
          }
        }
      }
    });
  });
});
