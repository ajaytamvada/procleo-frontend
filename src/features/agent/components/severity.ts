import type { Severity } from '../types/agent.types';

/** Map an exception severity to a Badge variant. */
export const severityVariant = (
  severity: Severity
): 'destructive' | 'warning' | 'info' => {
  switch (severity) {
    case 'CRITICAL':
      return 'destructive';
    case 'WARNING':
      return 'warning';
    default:
      return 'info';
  }
};

/** Human-friendly label from an UPPER_SNAKE enum. */
export const prettify = (value: string | null | undefined): string =>
  (value ?? '').toLowerCase().replace(/_/g, ' ');
