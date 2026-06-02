import { test } from '@playwright/test';

/**
 * Exploratory demo-readiness sweep.
 * Visits every page in the four demo flows (PR approval, PO, GRN, Invoice, Payment)
 * using the saved admin auth state, and records:
 *   - console errors
 *   - uncaught page exceptions
 *   - network responses with status >= 400
 * It asserts nothing about UI content — it just reports what actually breaks.
 */

const FLOWS: Record<string, string[]> = {
  'PR Approval': [
    '/purchase-requisition',
    '/purchase-requisition/manage',
    '/purchase-requisition/approve',
    '/purchase-requisition/status',
    '/purchase-requisition/preview',
  ],
  'Purchase Orders': [
    '/purchase-orders',
    '/purchase-orders/all',
    '/purchase-orders/approve',
    '/purchase-orders/modify',
  ],
  GRN: ['/grn', '/grn/list', '/grn/create', '/grn/approval', '/grn/modify'],
  Invoice: [
    '/invoice',
    '/invoice/list',
    '/invoice/entry',
    '/invoice/unmatched',
  ],
  Payment: ['/payment/list', '/payment/pending'],
};

for (const [flow, routes] of Object.entries(FLOWS)) {
  for (const route of routes) {
    test(`[${flow}] ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      const badResponses: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => pageErrors.push(err.message));
      page.on('response', res => {
        const s = res.status();
        if (s >= 400)
          badResponses.push(`${s} ${res.request().method()} ${res.url()}`);
      });

      await page.goto(route, { waitUntil: 'networkidle' }).catch(e => {
        pageErrors.push(`navigation: ${e.message}`);
      });
      // let lazy queries settle
      await page.waitForTimeout(2500);

      const report: string[] = [];
      if (pageErrors.length)
        report.push(`  PAGE ERRORS:\n    - ${pageErrors.join('\n    - ')}`);
      if (badResponses.length)
        report.push(`  HTTP >=400:\n    - ${badResponses.join('\n    - ')}`);
      if (consoleErrors.length)
        report.push(
          `  CONSOLE ERRORS:\n    - ${consoleErrors.slice(0, 8).join('\n    - ')}`
        );

      if (report.length) {
        console.log(
          `\n=== ISSUES @ [${flow}] ${route} ===\n${report.join('\n')}`
        );
      } else {
        console.log(`OK  [${flow}] ${route}`);
      }
    });
  }
}
