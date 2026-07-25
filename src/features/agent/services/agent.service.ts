/**
 * API service for the Agent PO feature. Uses the shared apiClient (JWT + refresh handled
 * centrally). URLs are relative to VITE_API_BASE_URL (which already includes /api).
 */

import { apiClient } from '@/lib/api';
import type {
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
  history: ChatHistoryItem[]
): Promise<ChatResponse> => {
  const response = await apiClient.post<ChatResponse>(`${BASE}/chat`, {
    message,
    history,
  });
  return response.data;
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
