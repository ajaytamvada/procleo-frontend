import { test, expect, Page } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// PO → PAYMENT WORKFLOW E2E TESTS
// ═══════════════════════════════════════════════════════════════
// Tests the complete procurement-to-payment flow:
//   Invoice (approved) → GRN creation → GRN approval
//   → Payment creation → Payment approval
//
// Prerequisites:
//   - Backend must be running at localhost:8080
//   - At least one APPROVED or THREE_WAY_MATCHED invoice must exist
//   - Frontend dev server running at localhost:3000
// ═══════════════════════════════════════════════════════════════

// ─── Helpers ───────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Wait for loading indicators to disappear, up to 15s */
async function waitForPageLoad(page: Page, timeout = 15000): Promise<void> {
  const loadingIndicator = page.getByText(/^Loading/i).first();
  try {
    await loadingIndicator.waitFor({ state: 'hidden', timeout });
  } catch {
    // Loading indicator may not have appeared at all
  }
  await page.waitForTimeout(500);
}

// ─── API Error Tracking ──────────────────────────────────────

interface ApiFailure {
  url: string;
  status: number;
  statusText: string;
  body: string;
}

/**
 * Attaches a listener that captures failed API responses (4xx/5xx).
 * Collected errors are reported in afterEach for debugging.
 */
function trackApiErrors(page: Page): ApiFailure[] {
  const failures: ApiFailure[] = [];
  page.on('response', async response => {
    const url = response.url();
    if (!url.includes('/api/')) return;
    if (response.status() >= 400) {
      let body = '';
      try {
        body = await response.text();
      } catch {
        body = '(could not read response body)';
      }
      failures.push({
        url: url.replace(/https?:\/\/[^/]+/, ''),
        status: response.status(),
        statusText: response.statusText(),
        body: body.substring(0, 500),
      });
    }
  });
  return failures;
}

// ─── Global hooks: track API errors on every test ─────────────

let apiErrors: ApiFailure[];

test.beforeEach(async ({ page }) => {
  apiErrors = trackApiErrors(page);
});

test.afterEach(async (_, testInfo) => {
  if (apiErrors.length > 0) {
    const report = apiErrors
      .map(
        f => `  ${f.status} ${f.statusText} — ${f.url}\n    Response: ${f.body}`
      )
      .join('\n\n');

    // Always attach errors to the HTML report for debugging
    await testInfo.attach('API Errors', {
      body: report,
      contentType: 'text/plain',
    });

    // If the test passed despite API errors, fail it explicitly
    if (testInfo.status === 'passed') {
      throw new Error(
        `Backend API errors detected (${apiErrors.length}):\n\n${report}`
      );
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// SECTION 1: BACKEND HEALTH CHECK
// Run this first — if the backend is broken, everything else
// will fail and you'll know exactly why.
// ═══════════════════════════════════════════════════════════════

test.describe('Backend API Health', () => {
  test('GET /api/payment should not return 500', async ({ page }) => {
    await page.goto('/payment/list');
    await waitForPageLoad(page);
    // If we reach here without API errors, the endpoint works.
    // The afterEach hook will catch any 500s automatically.
  });

  test('GET /api/payment/pending should not return 500', async ({ page }) => {
    await page.goto('/payment/pending');
    await waitForPageLoad(page);
  });

  test('GET /api/invoice/unmatched should not return 500', async ({ page }) => {
    await page.goto('/invoice/unmatched');
    await waitForPageLoad(page);
  });

  test('GET /api/grn (approval page) should not return 500', async ({
    page,
  }) => {
    await page.goto('/grn/approval');
    await waitForPageLoad(page);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 2: PAYMENT LIST PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Payment List Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payment/list');
    await waitForPageLoad(page);
  });

  test('should display page title and table structure', async ({ page }) => {
    await expect(page.getByText('Payments').first()).toBeVisible();

    // Status filter dropdown must be present
    const filter = page.locator('select').first();
    await expect(filter).toBeVisible();
    await expect(
      filter.locator('option', { hasText: 'All Statuses' })
    ).toBeAttached();

    // Table headers must be present
    await expect(page.getByText('Payment #').first()).toBeVisible();
    await expect(page.getByText('Invoice #').first()).toBeVisible();
    await expect(page.getByText('Supplier').first()).toBeVisible();
    await expect(page.getByText('Date').first()).toBeVisible();
    await expect(page.getByText('Amount').first()).toBeVisible();
    await expect(page.getByText('Method').first()).toBeVisible();
    await expect(page.getByText('Status').first()).toBeVisible();
    await expect(page.getByText('Actions').first()).toBeVisible();
  });

  test('should show payment rows or "No payments found"', async ({ page }) => {
    const tableBody = page.locator('table tbody');
    await expect(tableBody).toBeVisible();
    const bodyText = await tableBody.textContent();
    // Must show either payment data (PAY-) or the empty state
    expect(
      bodyText?.includes('PAY-') || bodyText?.includes('No payments found')
    ).toBeTruthy();
  });

  test('should filter payments by status', async ({ page }) => {
    const filter = page.locator('select').first();

    // Filter to PROCESSED
    await filter.selectOption('PROCESSED');
    await page.waitForTimeout(500);
    const bodyText = await page.locator('table tbody').textContent();
    // Should show only PROCESSED or "No payments found"
    expect(
      bodyText?.includes('PROCESSED') || bodyText?.includes('No payments found')
    ).toBeTruthy();

    // Reset to All
    await filter.selectOption('');
    await page.waitForTimeout(500);
  });

  test('should navigate to payment preview on View click', async ({ page }) => {
    const viewButton = page.getByRole('button', { name: /View/i }).first();
    const hasPayments = await viewButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasPayments) {
      test.skip(true, 'No payments exist yet — cannot test View navigation');
      return;
    }

    await viewButton.click();
    await waitForPageLoad(page);
    await expect(page.getByText('Payment Details')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 3: PENDING PAYMENTS (APPROVAL) PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Pending Payments Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payment/pending');
    await waitForPageLoad(page);
  });

  test('should display page title', async ({ page }) => {
    await expect(page.getByText('Pending Payment Approvals')).toBeVisible();
  });

  test('should show pending payment cards or "No payments pending"', async ({
    page,
  }) => {
    // One of these must be visible — not both invisible
    const emptyState = page.getByText('No payments pending approval');
    const paymentCard = page.getByText('Payment #').first();

    await expect(emptyState.or(paymentCard)).toBeVisible({ timeout: 5000 });
  });

  test('should show approve/reject buttons when payments exist', async ({
    page,
  }) => {
    const paymentCard = page.getByText('Payment #').first();
    const hasPayments = await paymentCard
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasPayments) {
      test.skip(
        true,
        'No pending payments — cannot test approve/reject buttons'
      );
      return;
    }

    // Card should show payment details
    await expect(page.getByText('Invoice').first()).toBeVisible();
    await expect(page.getByText('Supplier').first()).toBeVisible();
    await expect(page.getByText('Amount').first()).toBeVisible();

    // Action buttons
    await expect(
      page.getByRole('button', { name: /Approve & Process/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: /^Reject$/i }).first()
    ).toBeVisible();
  });

  test('should toggle reject input on Reject click', async ({ page }) => {
    const rejectBtn = page.getByRole('button', { name: /^Reject$/i }).first();
    const hasPayments = await rejectBtn
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasPayments) {
      test.skip(true, 'No pending payments — cannot test reject toggle');
      return;
    }

    // Click Reject → should show input
    await rejectBtn.click();
    await page.waitForTimeout(500);
    await expect(page.getByPlaceholder('Rejection reason...')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /Confirm Reject/i })
    ).toBeVisible();

    // Click Cancel → should hide input
    await page
      .getByRole('button', { name: /Cancel/i })
      .first()
      .click();
    await page.waitForTimeout(500);
    await expect(
      page.getByPlaceholder('Rejection reason...')
    ).not.toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 4: PAYMENT PREVIEW PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Payment Preview Page', () => {
  test('should display full payment details', async ({ page }) => {
    // Navigate via payment list
    await page.goto('/payment/list');
    await waitForPageLoad(page);

    const viewButton = page.getByRole('button', { name: /View/i }).first();
    const hasPayments = await viewButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasPayments) {
      test.skip(true, 'No payments exist — cannot test preview page');
      return;
    }

    await viewButton.click();
    await waitForPageLoad(page);

    // Page header
    await expect(page.getByText('Payment Details')).toBeVisible();
    await expect(page.getByRole('button', { name: /Back/i })).toBeVisible();

    // Details grid
    await expect(page.getByText(/Invoice:/i).first()).toBeVisible();
    await expect(page.getByText(/Supplier:/i).first()).toBeVisible();
    await expect(page.getByText(/Payment Date:/i).first()).toBeVisible();

    // Financial section
    await expect(page.getByText('Financial Details')).toBeVisible();
    await expect(page.getByText('Payment Amount').first()).toBeVisible();
    await expect(page.getByText('TDS Deducted').first()).toBeVisible();
    await expect(page.getByText('Net Amount').first()).toBeVisible();
    await expect(page.getByText(/₹/).first()).toBeVisible();
  });

  test('should navigate back to list on Back click', async ({ page }) => {
    await page.goto('/payment/list');
    await waitForPageLoad(page);

    const viewButton = page.getByRole('button', { name: /View/i }).first();
    const hasPayments = await viewButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasPayments) {
      test.skip(true, 'No payments exist — cannot test back navigation');
      return;
    }

    await viewButton.click();
    await waitForPageLoad(page);
    await page.getByRole('button', { name: /Back/i }).click();
    await waitForPageLoad(page);
    await expect(page.getByText('Payments').first()).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 5: PAYMENT ELIGIBILITY & CREATE PAYMENT FORM
// ═══════════════════════════════════════════════════════════════

test.describe('Create Payment Page', () => {
  test('should show eligibility card and form for an eligible invoice', async ({
    page,
  }) => {
    // Find an invoice eligible for payment
    await page.goto('/invoice/list');
    await waitForPageLoad(page);

    const statusFilter = page.locator('select').first();
    let found = false;

    // Try statuses in order of likelihood
    for (const status of ['THREE_WAY_MATCHED', 'APPROVED', 'PARTIALLY_PAID']) {
      await statusFilter.selectOption(status);
      await page.waitForTimeout(1000);

      const paymentButton = page
        .locator('button[title="Record Payment"]')
        .first();
      if (await paymentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await paymentButton.click();
        await waitForPageLoad(page);
        found = true;
        break;
      }
    }

    if (!found) {
      test.skip(
        true,
        'No invoices with Record Payment action — need APPROVED/THREE_WAY_MATCHED invoice with GRN'
      );
      return;
    }

    // Must be on Create Payment page
    await expect(page.getByText('Create Payment')).toBeVisible();

    // Eligibility card — must show either eligible or not eligible (not stuck loading)
    const eligible = page.getByText('Eligible for Payment');
    const notEligible = page.getByText('Not Eligible');
    await expect(eligible.or(notEligible)).toBeVisible({ timeout: 5000 });

    // Eligibility info must always be shown
    await expect(page.getByText(/Invoice:/i).first()).toBeVisible();
    await expect(page.getByText(/Max Payable:/i).first()).toBeVisible();
    await expect(page.getByText(/Remaining:/i).first()).toBeVisible();

    // If eligible, form must be visible
    if (await eligible.isVisible().catch(() => false)) {
      await expect(page.getByText('Payment Date')).toBeVisible();
      await expect(page.getByText('Payment Amount')).toBeVisible();
      await expect(page.getByText('Payment Method')).toBeVisible();
      await expect(
        page.getByText('Payment Reference (UTR/Cheque No.)')
      ).toBeVisible();
      await expect(page.getByText('TDS Amount')).toBeVisible();
      await expect(page.getByText('Remarks')).toBeVisible();

      // Buttons
      await expect(
        page.getByRole('button', { name: /Submit for Approval/i })
      ).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Save as Draft/i })
      ).toBeVisible();
      await expect(page.getByRole('button', { name: /Cancel/i })).toBeVisible();

      // Date pre-filled
      const dateInput = page.locator('input[type="date"]').first();
      expect(await dateInput.inputValue()).toBe(todayISO());

      // Submit disabled without amount
      await expect(
        page.getByRole('button', { name: /Submit for Approval/i })
      ).toBeDisabled();

      // Payment method dropdown has options
      const methodSelect = page.locator('select').first();
      await expect(
        methodSelect.locator('option', { hasText: 'Select Method' })
      ).toBeAttached();
      await expect(
        methodSelect.locator('option', { hasText: 'NEFT' })
      ).toBeAttached();
    } else {
      // Not eligible — reason must be displayed
      const reason = page.locator('.text-red-700');
      await expect(reason).toBeVisible();
      const reasonText = await reason.textContent();
      expect(reasonText!.length).toBeGreaterThan(0);

      await page.screenshot({
        path: 'e2e/screenshots/payment-not-eligible.png',
        fullPage: true,
      });
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 6: GRN CREATION & APPROVAL
// ═══════════════════════════════════════════════════════════════

test.describe('GRN Creation', () => {
  test('should display GRN creation form with invoice dropdown', async ({
    page,
  }) => {
    await page.goto('/grn/create');
    await waitForPageLoad(page);

    await expect(page.getByText('Create GRN').first()).toBeVisible();
    await expect(
      page.getByText('Create Goods Receipt Note from invoice')
    ).toBeVisible();

    // Invoice dropdown must exist. The rest of the form (received date, items) is
    // revealed only AFTER an invoice is selected — this is a two-step flow.
    const invoiceSelect = page.locator('select').first();
    await expect(invoiceSelect).toBeVisible();

    const optionCount = await invoiceSelect.locator('option').count();
    if (optionCount <= 1) {
      test.skip(true, 'No invoices available for GRN creation');
      return;
    }

    // Select first available invoice and verify the form populates
    await invoiceSelect.selectOption({ index: 1 });
    await page.waitForTimeout(1500);

    // Received date is now present and pre-filled
    const dateInput = page.locator('input[type="date"]').first();
    await expect(dateInput).toBeVisible();
    expect(await dateInput.inputValue()).toBeTruthy();

    // Items table should appear
    const itemRows = page.locator('table tbody tr');
    expect(await itemRows.count()).toBeGreaterThan(0);

    await page.screenshot({
      path: 'e2e/screenshots/grn-creation-form.png',
      fullPage: true,
    });
  });
});

test.describe('GRN Approval', () => {
  test('should display approval page with table or empty state', async ({
    page,
  }) => {
    await page.goto('/grn/approval');
    await waitForPageLoad(page);

    await expect(page.getByText('GRN Approval')).toBeVisible();
    await expect(
      page.getByText('Review and approve Goods Receipt Notes')
    ).toBeVisible();

    // Search and date filters must be present
    await expect(
      page.getByPlaceholder(/Search by GRN, Invoice number or Supplier/i)
    ).toBeVisible();
    const dateInputs = page.locator('input[type="date"]');
    expect(await dateInputs.count()).toBeGreaterThanOrEqual(2);

    // Must show either GRN table or empty state
    const approveBtn = page.getByRole('button', { name: /Approve/i }).first();
    const emptyState = page.getByText('No GRNs pending approval');
    await expect(approveBtn.or(emptyState)).toBeVisible({ timeout: 5000 });

    // If GRNs exist, verify table structure
    if (await approveBtn.isVisible().catch(() => false)) {
      await expect(page.getByText('GRN Number').first()).toBeVisible();
      await expect(page.getByText('Invoice Number').first()).toBeVisible();
      await expect(page.getByText('Supplier').first()).toBeVisible();
    }
  });

  test('should open and close approval modal', async ({ page }) => {
    await page.goto('/grn/approval');
    await waitForPageLoad(page);

    const approveBtn = page.getByRole('button', { name: /^Approve$/i }).first();
    const hasGRNs = await approveBtn
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasGRNs) {
      test.skip(true, 'No GRNs pending approval');
      return;
    }

    await approveBtn.click();
    await page.waitForTimeout(1000);

    // Modal should appear with Approve GRN button
    await expect(
      page.getByRole('button', { name: /Approve GRN/i })
    ).toBeVisible();

    // Cancel to close
    await page
      .getByRole('button', { name: /Cancel/i })
      .first()
      .click();
    await page.waitForTimeout(500);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 7: UNMATCHED INVOICES PAGE
// ═══════════════════════════════════════════════════════════════

test.describe('Unmatched Invoices Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/invoice/unmatched');
    await waitForPageLoad(page);
  });

  test('should display page with title and content', async ({ page }) => {
    await expect(page.getByText('Unmatched Email Invoices')).toBeVisible();
    await expect(
      page.getByText(/need to be linked to a Purchase Order/i)
    ).toBeVisible();

    // Must show either table or empty state
    const emptyState = page.getByText('No unmatched invoices');
    const table = page.locator('table');
    await expect(emptyState.or(table)).toBeVisible({ timeout: 5000 });
  });

  test('should show correct table headers when invoices exist', async ({
    page,
  }) => {
    const table = page.locator('table');
    const hasTable = await table
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasTable) {
      test.skip(true, 'No unmatched invoices exist');
      return;
    }

    await expect(page.getByText('Invoice #').first()).toBeVisible();
    await expect(page.getByText('Supplier').first()).toBeVisible();
    await expect(page.getByText('Amount').first()).toBeVisible();
    await expect(page.getByText('Match Status').first()).toBeVisible();
    await expect(page.getByText('OCR Confidence').first()).toBeVisible();
  });

  test('should open PO candidates modal on "Link to PO" click', async ({
    page,
  }) => {
    const linkButton = page
      .getByRole('button', { name: /Link to PO/i })
      .first();
    const hasInvoices = await linkButton
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!hasInvoices) {
      test.skip(true, 'No unmatched invoices to link');
      return;
    }

    await linkButton.click();
    await waitForPageLoad(page);

    // Modal
    await expect(page.getByText(/Link Invoice .* to PO/i)).toBeVisible();

    // Close
    await page.getByRole('button', { name: /Close/i }).click();
    await page.waitForTimeout(500);
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 8: FULL WORKFLOW
// These tests execute real actions (create, approve, reject).
// They modify data in the system.
// ═══════════════════════════════════════════════════════════════

test.describe('Full PO→Payment Workflow', () => {
  test('TC-01: Create payment and submit for approval', async ({ page }) => {
    // STEP 1: Find an eligible invoice
    await page.goto('/invoice/list');
    await waitForPageLoad(page);

    const statusFilter = page.locator('select').first();
    let found = false;

    for (const status of ['THREE_WAY_MATCHED', 'APPROVED', 'PARTIALLY_PAID']) {
      await statusFilter.selectOption(status);
      await page.waitForTimeout(1000);

      const paymentButton = page
        .locator('button[title="Record Payment"]')
        .first();
      if (await paymentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await paymentButton.click();
        await waitForPageLoad(page);
        found = true;
        break;
      }
    }

    if (!found) {
      test.skip(
        true,
        'No invoices eligible for payment (need APPROVED/THREE_WAY_MATCHED with GRN)'
      );
      return;
    }

    await expect(page.getByText('Create Payment')).toBeVisible();

    // STEP 2: Verify eligibility
    const eligible = page.getByText('Eligible for Payment');
    if (!(await eligible.isVisible({ timeout: 5000 }).catch(() => false))) {
      // Not eligible — screenshot and fail with info
      await page.screenshot({
        path: 'e2e/screenshots/tc01-not-eligible.png',
        fullPage: true,
      });
      const reason = await page.locator('.text-red-700').textContent();
      test.skip(true, `Invoice not eligible: ${reason}`);
      return;
    }

    // STEP 3: Fill the payment form
    const amountInput = page.locator('input[type="number"]').first();
    await amountInput.fill('100');

    const methodSelect = page.locator('select').first();
    await methodSelect.selectOption('NEFT');

    const refInput = page.locator('input[type="text"]').first();
    await refInput.fill('E2E-UTR-' + Date.now());

    const remarks = page.locator('textarea');
    await remarks.fill('E2E test payment - TC01');

    await page.screenshot({
      path: 'e2e/screenshots/tc01-form-filled.png',
      fullPage: true,
    });

    // STEP 4: Submit for approval
    const submitBtn = page.getByRole('button', {
      name: /Submit for Approval/i,
    });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();
    await waitForPageLoad(page);

    // STEP 5: Verify redirect to payment list
    await expect(page).toHaveURL(/payment\/list/, { timeout: 10000 });
    await expect(page.getByText('Payments').first()).toBeVisible();

    // STEP 6: Verify payment exists in list
    const tableBody = page.locator('table tbody');
    const bodyText = await tableBody.textContent();
    expect(bodyText).toContain('PAY-');

    await page.screenshot({
      path: 'e2e/screenshots/tc01-payment-in-list.png',
      fullPage: true,
    });
  });

  test('TC-02: Create payment and save as draft', async ({ page }) => {
    await page.goto('/invoice/list');
    await waitForPageLoad(page);

    const statusFilter = page.locator('select').first();
    let found = false;

    for (const status of ['THREE_WAY_MATCHED', 'APPROVED', 'PARTIALLY_PAID']) {
      await statusFilter.selectOption(status);
      await page.waitForTimeout(1000);

      const paymentButton = page
        .locator('button[title="Record Payment"]')
        .first();
      if (await paymentButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await paymentButton.click();
        await waitForPageLoad(page);
        found = true;
        break;
      }
    }

    if (!found) {
      test.skip(true, 'No invoices eligible for payment');
      return;
    }

    const eligible = page.getByText('Eligible for Payment');
    if (!(await eligible.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip(true, 'Invoice not eligible for payment');
      return;
    }

    // Fill minimal form
    await page.locator('input[type="number"]').first().fill('50');

    // Save as Draft
    const draftBtn = page.getByRole('button', { name: /Save as Draft/i });
    await expect(draftBtn).toBeEnabled();
    await draftBtn.click();
    await waitForPageLoad(page);

    // Verify redirect
    await expect(page).toHaveURL(/payment\/list/, { timeout: 10000 });

    // Filter to DRAFT to verify
    const listFilter = page.locator('select').first();
    await listFilter.selectOption('DRAFT');
    await page.waitForTimeout(500);

    const bodyText = await page.locator('table tbody').textContent();
    expect(bodyText).toContain('DRAFT');

    await page.screenshot({
      path: 'e2e/screenshots/tc02-draft-payment.png',
      fullPage: true,
    });
  });

  test('TC-03: Approve a pending payment → verify PROCESSED', async ({
    page,
  }) => {
    await page.goto('/payment/pending');
    await waitForPageLoad(page);

    const approveBtn = page
      .getByRole('button', { name: /Approve & Process/i })
      .first();
    const hasPayments = await approveBtn
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!hasPayments) {
      test.skip(
        true,
        'No pending payments to approve — run TC-01 first to create one'
      );
      return;
    }

    // Capture payment number
    const paymentNumberEl = page.locator('.font-medium').first();
    const paymentNumber = (await paymentNumberEl.textContent())?.trim() || '';

    // Approve
    await approveBtn.click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'e2e/screenshots/tc03-after-approve.png',
      fullPage: true,
    });

    // Verify in payment list as PROCESSED
    await page.goto('/payment/list');
    await waitForPageLoad(page);

    const processedFilter = page.locator('select').first();
    await processedFilter.selectOption('PROCESSED');
    await page.waitForTimeout(500);

    const bodyText = await page.locator('table tbody').textContent();
    expect(
      bodyText?.includes('PROCESSED') || bodyText?.includes(paymentNumber)
    ).toBeTruthy();

    await page.screenshot({
      path: 'e2e/screenshots/tc03-processed-in-list.png',
      fullPage: true,
    });
  });

  test('TC-04: Reject a pending payment with remarks', async ({ page }) => {
    await page.goto('/payment/pending');
    await waitForPageLoad(page);

    const rejectBtn = page.getByRole('button', { name: /^Reject$/i }).first();
    const hasPayments = await rejectBtn
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!hasPayments) {
      test.skip(
        true,
        'No pending payments to reject — run TC-01 first to create one'
      );
      return;
    }

    // Click Reject → enter reason → confirm
    await rejectBtn.click();
    await page.waitForTimeout(500);

    const remarkInput = page.getByPlaceholder('Rejection reason...');
    await expect(remarkInput).toBeVisible();
    await remarkInput.fill('E2E test rejection - insufficient documentation');

    await page.getByRole('button', { name: /Confirm Reject/i }).click();
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: 'e2e/screenshots/tc04-after-reject.png',
      fullPage: true,
    });

    // Verify in payment list as REJECTED
    await page.goto('/payment/list');
    await waitForPageLoad(page);

    const rejectedFilter = page.locator('select').first();
    await rejectedFilter.selectOption('REJECTED');
    await page.waitForTimeout(500);

    const bodyText = await page.locator('table tbody').textContent();
    expect(bodyText).toContain('REJECTED');

    await page.screenshot({
      path: 'e2e/screenshots/tc04-rejected-in-list.png',
      fullPage: true,
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// SECTION 9: CROSS-PAGE NAVIGATION
// ═══════════════════════════════════════════════════════════════

test.describe('Payment Navigation', () => {
  test('should navigate through all payment-related pages', async ({
    page,
  }) => {
    // Payment List
    await page.goto('/payment/list');
    await waitForPageLoad(page);
    await expect(page.getByText('Payments').first()).toBeVisible();

    // Pending Payments
    await page.goto('/payment/pending');
    await waitForPageLoad(page);
    await expect(page.getByText('Pending Payment Approvals')).toBeVisible();

    // Unmatched Invoices
    await page.goto('/invoice/unmatched');
    await waitForPageLoad(page);
    await expect(page.getByText('Unmatched Email Invoices')).toBeVisible();

    // GRN Create
    await page.goto('/grn/create');
    await waitForPageLoad(page);
    await expect(page.getByText('Create GRN').first()).toBeVisible();

    // GRN Approval
    await page.goto('/grn/approval');
    await waitForPageLoad(page);
    await expect(page.getByText('GRN Approval')).toBeVisible();
  });

  test('should reach Create Payment from invoice list', async ({ page }) => {
    await page.goto('/invoice/list');
    await waitForPageLoad(page);

    const paymentButton = page
      .locator('button[title="Record Payment"]')
      .first();
    const hasButton = await paymentButton
      .isVisible({ timeout: 3000 })
      .catch(() => false);

    if (!hasButton) {
      test.skip(true, 'No invoices with Record Payment button visible');
      return;
    }

    await paymentButton.click();
    await waitForPageLoad(page);
    await expect(page.getByText('Create Payment')).toBeVisible();
  });
});
