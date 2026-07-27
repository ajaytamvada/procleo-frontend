/**
 * API service for the Agent PO feature. Uses the shared apiClient (JWT + refresh handled
 * centrally). URLs are relative to VITE_API_BASE_URL (which already includes /api).
 */

import { apiClient, TokenManager } from '@/lib/api';
import { env } from '@/utils/env';
import type {
  AgentAnalytics,
  ApprovalDecision,
  ApprovalItem,
  Brief,
  ChatHistoryItem,
  ChatResponse,
  EnrollResponse,
  ExceptionAlert,
  SimulateInboundRequest,
  SimulateInboundResult,
  SpringPage,
  ThreadView,
  TimelineEntry,
} from '../types/agent.types';

const BASE = '/agent';

export const getExceptions = async (
  status = 'open',
  severity?: string,
  page = 0,
  size = 20
): Promise<SpringPage<ExceptionAlert>> => {
  const params: Record<string, string | number> = { status, page, size };
  if (severity) {
    params.severity = severity;
  }
  const response = await apiClient.get<SpringPage<ExceptionAlert>>(
    `${BASE}/exceptions`,
    { params }
  );
  return response.data;
};

export const resolveException = async (
  id: number,
  resolvedBy?: number,
  status?: string
): Promise<void> => {
  const params: Record<string, string | number> = {};
  if (resolvedBy != null) params.resolvedBy = resolvedBy;
  if (status) params.status = status;
  await apiClient.post(`${BASE}/exceptions/${id}/resolve`, null, { params });
};

export const getBrief = async (): Promise<Brief> => {
  const response = await apiClient.get<Brief>(`${BASE}/brief`);
  return response.data;
};

export const getApprovals = async (): Promise<ApprovalItem[]> => {
  const response = await apiClient.get<ApprovalItem[]>(`${BASE}/approvals`);
  return Array.isArray(response.data) ? response.data : [];
};

export const decideApproval = async (
  taskId: number,
  decision: ApprovalDecision
): Promise<{ taskId: number; outcome: string }> => {
  const response = await apiClient.post<{ taskId: number; outcome: string }>(
    `${BASE}/approvals/${taskId}`,
    decision
  );
  return response.data;
};

export const getTimeline = async (poId: number): Promise<TimelineEntry[]> => {
  const response = await apiClient.get<TimelineEntry[]>(
    `${BASE}/pos/${poId}/timeline`
  );
  return Array.isArray(response.data) ? response.data : [];
};

export const getThread = async (poId: number): Promise<ThreadView> => {
  const response = await apiClient.get<ThreadView>(
    `${BASE}/pos/${poId}/thread`
  );
  return response.data;
};

export const enrollPo = async (poId: number): Promise<EnrollResponse> => {
  const response = await apiClient.post<EnrollResponse>(
    `${BASE}/pos/${poId}/enroll`
  );
  return response.data;
};

export const pausePo = async (poId: number): Promise<void> => {
  await apiClient.post(`${BASE}/pos/${poId}/pause`);
};

// --- Test-only helpers (guarded by agent.test-endpoints.enabled on the backend) ---

export const runTick = async (): Promise<void> => {
  await apiClient.post(`${BASE}/_test/tick`);
};

export const simulateInbound = async (
  request: SimulateInboundRequest
): Promise<SimulateInboundResult> => {
  const response = await apiClient.post<SimulateInboundResult>(
    `${BASE}/_test/inbound`,
    request
  );
  return response.data;
};

// --- Chat ---

export const sendChat = async (
  message: string,
  history: ChatHistoryItem[],
  context?: string
): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>(`${BASE}/chat`, {
    message,
    history,
    context,
  });
  return response.data;
};

/** Callbacks for a streamed chat turn. */
export interface StreamHandlers {
  onStep?: (text: string) => void;
  onToken?: (text: string) => void;
  onMeta?: (suggestions: string[]) => void;
  onFinal?: (response: ChatResponse) => void;
  onError?: (message: string) => void;
  onDone?: () => void;
}

/**
 * Stream a chat turn over SSE. Uses fetch (not EventSource) so we can POST the message/history and
 * send the JWT. Dispatches the backend's step/token/meta/final/error/done events to the handlers.
 * Resolves when the stream ends. Pass an AbortSignal to cancel.
 */
export const streamChat = async (
  message: string,
  history: ChatHistoryItem[],
  context: string | undefined,
  handlers: StreamHandlers,
  signal?: AbortSignal
): Promise<void> => {
  const token = TokenManager.getAccessToken();
  const response = await fetch(`${env.VITE_API_BASE_URL}/agent/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, history, context }),
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Stream failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const dispatch = (eventName: string, data: string) => {
    let payload: Record<string, unknown>;
    try {
      payload = data ? JSON.parse(data) : {};
    } catch {
      return;
    }
    switch (eventName) {
      case 'step':
        handlers.onStep?.(String(payload.text ?? ''));
        break;
      case 'token':
        handlers.onToken?.(String(payload.text ?? ''));
        break;
      case 'meta':
        handlers.onMeta?.((payload.suggestions as string[]) ?? []);
        break;
      case 'final':
        handlers.onFinal?.(payload as unknown as ChatResponse);
        break;
      case 'error':
        handlers.onError?.(
          String(payload.message ?? 'The assistant hit an error.')
        );
        break;
      case 'done':
        handlers.onDone?.();
        break;
    }
  };

  // Parse SSE frames: events are separated by a blank line; each frame has `event:` and `data:` lines.
  const flushFrame = (frame: string) => {
    let eventName = 'message';
    const dataLines: string[] = [];
    for (const line of frame.split('\n')) {
      if (line.startsWith('event:')) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        dataLines.push(line.slice(5).trimStart());
      }
    }
    if (dataLines.length > 0) {
      dispatch(eventName, dataLines.join('\n'));
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (frame.trim()) flushFrame(frame);
    }
  }
  if (buffer.trim()) flushFrame(buffer);
};

export const confirmAction = async (
  actionId: number,
  confirm: boolean
): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>(`${BASE}/chat/confirm`, {
    actionId,
    confirm,
  });
  return response.data;
};

export const submitFeedback = async (
  rating: 'up' | 'down',
  userMessage: string,
  assistantReply: string
): Promise<void> => {
  await apiClient.post(`${BASE}/chat/feedback`, {
    rating,
    userMessage,
    assistantReply,
  });
};

export const getAnalytics = async (): Promise<AgentAnalytics> => {
  const response = await apiClient.get<AgentAnalytics>(`${BASE}/analytics`);
  return response.data;
};
