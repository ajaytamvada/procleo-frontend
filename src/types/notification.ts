/**
 * Shape returned by the /notifications/me endpoints (NotificationDto on the backend).
 * Note: field names are refType/refId/read (not referenceType/referenceId/isRead).
 */
export interface AppNotification {
  id: number;
  title: string;
  message: string;
  /** Business event, e.g. PR_PENDING_APPROVAL. */
  type?: string;
  /** Coarse grouping: APPROVAL / PURCHASE_ORDER / INVOICE / PAYMENT / RFP / GRN / SYSTEM. */
  category?: string;
  /** LOW / NORMAL / HIGH / URGENT. */
  priority?: string;
  /** Linked entity type: PR / PURCHASE_ORDER / GRN / INVOICE / RFP / PAYMENT. */
  refType?: string;
  refId?: number;
  /** Precomputed relative deep-link; navigate here directly. */
  actionUrl?: string;
  /** Display name of whoever triggered the event, if known. */
  actorName?: string;
  read: boolean;
  createdAt: string; // ISO string
}
