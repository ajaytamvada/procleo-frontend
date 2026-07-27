/**
 * React Query hooks for the Agent PO feature.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  confirmAction,
  decideApproval,
  enrollPo,
  getAnalytics,
  getApprovals,
  getBrief,
  getExceptions,
  submitFeedback,
  getThread,
  getTimeline,
  pausePo,
  resolveException,
  runTick,
  sendChat,
  simulateInbound,
} from '../services/agent.service';
import type {
  ApprovalDecision,
  ChatHistoryItem,
  SimulateInboundRequest,
} from '../types/agent.types';

const errText = (error: any, fallback: string): string =>
  error?.message || error?.response?.data?.message || fallback;

export const useExceptions = (
  status = 'open',
  severity?: string,
  page = 0,
  size = 20
) =>
  useQuery({
    queryKey: ['agent-exceptions', status, severity ?? '', page, size],
    queryFn: () => getExceptions(status, severity, page, size),
    staleTime: 15000,
  });

export const useResolveException = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, resolvedBy }: { id: number; resolvedBy?: number }) =>
      resolveException(id, resolvedBy, 'resolved'),
    onSuccess: () => {
      toast.success('Exception resolved');
      queryClient.invalidateQueries({ queryKey: ['agent-exceptions'] });
    },
    onError: (error: any) =>
      toast.error(errText(error, 'Failed to resolve exception')),
  });
};

export const useBrief = () =>
  useQuery({
    queryKey: ['agent-brief'],
    queryFn: getBrief,
    staleTime: 30000,
  });

export const useAnalytics = () =>
  useQuery({
    queryKey: ['agent-analytics'],
    queryFn: getAnalytics,
    staleTime: 60000,
  });

export const useSubmitFeedback = () =>
  useMutation({
    mutationFn: ({
      rating,
      userMessage,
      assistantReply,
    }: {
      rating: 'up' | 'down';
      userMessage: string;
      assistantReply: string;
    }) => submitFeedback(rating, userMessage, assistantReply),
    onError: () => {
      /* feedback is best-effort; stay silent on failure */
    },
  });

export const useApprovals = () =>
  useQuery({
    queryKey: ['agent-approvals'],
    queryFn: getApprovals,
    staleTime: 15000,
  });

export const useDecideApproval = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      decision,
    }: {
      taskId: number;
      decision: ApprovalDecision;
    }) => decideApproval(taskId, decision),
    onSuccess: result => {
      toast.success(`Draft ${result.outcome}`);
      queryClient.invalidateQueries({ queryKey: ['agent-approvals'] });
    },
    onError: (error: any) =>
      toast.error(errText(error, 'Failed to process approval')),
  });
};

export const useTimeline = (poId: number | null) =>
  useQuery({
    queryKey: ['agent-timeline', poId],
    queryFn: () => getTimeline(poId!),
    enabled: poId != null,
    staleTime: 10000,
  });

export const useThread = (poId: number | null) =>
  useQuery({
    queryKey: ['agent-thread', poId],
    queryFn: () => getThread(poId!),
    enabled: poId != null,
    staleTime: 10000,
  });

export const useEnrollPo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poId: number) => enrollPo(poId),
    onSuccess: res => {
      toast.success(
        res.newlyEnrolled ? 'PO enrolled into agent tracking' : res.message
      );
      queryClient.invalidateQueries({ queryKey: ['agent-timeline'] });
    },
    onError: (error: any) => toast.error(errText(error, 'Failed to enroll PO')),
  });
};

export const usePausePo = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (poId: number) => pausePo(poId),
    onSuccess: () => {
      toast.success('Agent paused for this PO');
      queryClient.invalidateQueries({ queryKey: ['agent-timeline'] });
    },
    onError: (error: any) => toast.error(errText(error, 'Failed to pause PO')),
  });
};

export const useRunTick = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => runTick(),
    onSuccess: () => {
      toast.success('Agent loop ran');
      queryClient.invalidateQueries({ queryKey: ['agent-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['agent-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['agent-timeline'] });
    },
    onError: (error: any) =>
      toast.error(errText(error, 'Failed to run agent loop')),
  });
};

export const useSimulateInbound = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SimulateInboundRequest) => simulateInbound(request),
    onSuccess: result => {
      toast.success(
        `Reply parsed: ${result.intent} (${Math.round(result.confidence * 100)}%)`
      );
      queryClient.invalidateQueries({ queryKey: ['agent-timeline'] });
      queryClient.invalidateQueries({ queryKey: ['agent-thread'] });
      queryClient.invalidateQueries({ queryKey: ['agent-exceptions'] });
    },
    onError: (error: any) =>
      toast.error(errText(error, 'Failed to simulate reply')),
  });
};

export const useSendChat = () =>
  useMutation({
    mutationFn: ({
      message,
      history,
      context,
    }: {
      message: string;
      history: ChatHistoryItem[];
      context?: string;
    }) => sendChat(message, history, context),
    onError: (error: any) =>
      toast.error(errText(error, 'The assistant could not respond')),
  });

export const useConfirmAction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      actionId,
      confirm,
    }: {
      actionId: number;
      confirm: boolean;
    }) => confirmAction(actionId, confirm),
    onSuccess: () => {
      // A confirmed action may change any of these.
      queryClient.invalidateQueries({ queryKey: ['agent-exceptions'] });
      queryClient.invalidateQueries({ queryKey: ['agent-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['agent-timeline'] });
    },
    onError: (error: any) =>
      toast.error(errText(error, 'Could not complete the action')),
  });
};
