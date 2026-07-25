/**
 * Types for the Agent PO (post-PO agentic follow-up) feature.
 * Mirrors the backend DTOs under com.autovitica.p2p.agent.dto.
 */

export type Severity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface ExceptionAlert {
  id: number;
  trackingId: number;
  poId: number | null;
  poNumber: string | null;
  supplierName: string | null;
  alertType: string;
  severity: Severity;
  status: string;
  detail: string | null;
  createdAt: string | null;
}

export interface ApprovalItem {
  taskId: number;
  taskType: string;
  trackingId: number;
  poId: number | null;
  poNumber: string | null;
  supplierName: string | null;
  toAddress: string | null;
  subject: string | null;
  body: string | null;
  scheduledAt: string | null;
}

export interface ApprovalDecision {
  action: 'APPROVE' | 'EDIT_APPROVE' | 'SKIP';
  editedSubject?: string;
  editedBody?: string;
  approverUserId?: number;
}

export interface TimelineEntry {
  timestamp: string | null;
  kind: string;
  actor: string | null;
  summary: string | null;
  detail: string | null;
}

export interface ThreadMessage {
  id: number;
  direction: string;
  fromAddress: string;
  toAddress: string;
  body: string;
  sentAt: string | null;
}

export interface ThreadView {
  threadId: number | null;
  poId: number;
  threadToken: string | null;
  subject: string | null;
  contactEmail: string | null;
  messages: ThreadMessage[];
}

export interface EnrollResponse {
  trackingId: number;
  poId: number;
  agentStatus: string;
  newlyEnrolled: boolean;
  message: string;
}

export interface SimulateInboundRequest {
  threadToken?: string;
  poId?: number;
  fromAddress?: string;
  body?: string;
}

export interface SimulateInboundResult {
  extractionId: number;
  intent: string;
  confidence: number;
  extractedDeliveryDate: string | null;
  needsReview: boolean;
}

/** Spring Data Page envelope (the shape Page<T> serializes to). */
export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// --- Chat ---

export interface ProposedAction {
  actionId: number;
  tool: string;
  summary: string;
}

/** A deep link to a pre-filled create screen. */
export interface Handoff {
  label: string;
  route: string;
}

/** Backend reply from /agent/chat and /agent/chat/confirm. */
export interface ChatResponse {
  type: 'answer' | 'proposed_action' | 'result' | 'handoff';
  message: string;
  proposedAction?: ProposedAction | null;
  handoff?: Handoff | null;
  /** Trail of the lookups the agent ran to get here. */
  steps?: string[] | null;
}

// --- Proactive brief ---

export interface BriefItem {
  kind: string;
  count: number;
  title: string;
  detail: string | null;
  actionUrl: string | null;
  severity: 'info' | 'warning' | 'critical';
}

export interface Brief {
  headline: string;
  generatedAt: string | null;
  totalCount: number;
  items: BriefItem[];
}

/** History item sent back to the server for context. */
export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

/** A message rendered in the chat UI. */
export interface ChatUiMessage {
  role: 'user' | 'assistant';
  content: string;
  proposedAction?: ProposedAction | null;
  handoff?: Handoff | null;
  /** Set once a proposed action has been confirmed or cancelled, to disable the buttons. */
  actionResolved?: boolean;
  /** Lookups the agent ran before answering. */
  steps?: string[] | null;
}
