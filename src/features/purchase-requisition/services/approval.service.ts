/**
 * API service for PR Approval functionality
 */

import { apiClient } from '@/lib/api';
import type {
  PRApprovalListItem,
  PRApprovalDetail,
  PRApprovalRequest,
} from '../types/approval.types';

const API_BASE_URL = '/purchase/requests';

/**
 * Get list of PRs pending approval
 */
export const getPRsPendingApproval = async (
  status: string = 'waiting'
): Promise<PRApprovalListItem[]> => {
  try {
    const response = await apiClient.get<PRApprovalListItem[]>(
      `${API_BASE_URL}/approval-queue`,
      { params: { status } }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getPRsPendingApproval error:', error);
    throw error;
  }
};

/**
 * Get PR details for approval with all items
 */
export const getPRDetailsForApproval = async (
  prId: number,
  status: string = 'waiting'
): Promise<PRApprovalDetail> => {
  try {
    const response = await apiClient.get<PRApprovalDetail>(
      `${API_BASE_URL}/approval-detail/${prId}`,
      { params: { status } }
    );
    return response.data;
  } catch (error) {
    console.error('getPRDetailsForApproval error:', error);
    throw error;
  }
};

/**
 * Approve or reject selected PR items
 */
export const approvePRItems = async (
  prId: number,
  approvalRequest: PRApprovalRequest
): Promise<void> => {
  try {
    await apiClient.post(`${API_BASE_URL}/${prId}/approve`, approvalRequest);
  } catch (error) {
    console.error('approvePRItems error:', error);
    throw error;
  }
};
