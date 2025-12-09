/**
 * API Service for Create RFP from Approved PRs workflow
 */

import { apiClient } from '@/lib/api';
import type {
  ApprovedPRForRFP,
  ApprovedPRItemForRFP,
  CreateRFPFromPRsRequest,
} from '../types/rfpFromPR';
import type { RFP } from '../types';

const RFP_FROM_PR_BASE_URL = '/rfp';

/**
 * Fetch all approved PRs that are available for RFP creation
 * @param searchWord Optional search term
 * @returns List of approved PRs
 */
export const getApprovedPRsForRFPCreation = async (
  searchWord?: string
): Promise<ApprovedPRForRFP[]> => {
  const params = searchWord ? { searchWord } : {};
  const response = await apiClient.get<ApprovedPRForRFP[]>(
    `${RFP_FROM_PR_BASE_URL}/approved-prs`,
    { params }
  );

  // Defensive programming: ensure we return an array
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Fetch approved PR items for selected PR IDs
 * @param prIds List of PR IDs
 * @returns List of approved PR items
 */
export const getApprovedPRItemsForRFPCreation = async (
  prIds: number[]
): Promise<ApprovedPRItemForRFP[]> => {
  if (!prIds || prIds.length === 0) {
    return [];
  }

  const response = await apiClient.post<ApprovedPRItemForRFP[]>(
    `${RFP_FROM_PR_BASE_URL}/approved-pr-items`,
    prIds
  );

  // Defensive programming: ensure we return an array
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Create RFP from selected approved PR items
 * @param request RFP creation request
 * @returns Created RFP
 */
export const createRFPFromPRs = async (
  request: CreateRFPFromPRsRequest
): Promise<RFP> => {
  const response = await apiClient.post<RFP>(
    `${RFP_FROM_PR_BASE_URL}/create-from-prs`,
    request
  );
  return response.data;
};
