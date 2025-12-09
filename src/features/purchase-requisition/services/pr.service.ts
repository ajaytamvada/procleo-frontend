/**
 * API service for Purchase Requisition management
 */

import { apiClient } from '@/lib/api';
import type { PRListItem, PRDetail } from '../types/pr.types';

const API_BASE_URL = '/purchase/requests';

/**
 * Get all draft PRs (not sent for approval)
 */
export const getAllDrafts = async (): Promise<PRListItem[]> => {
  try {
    const response = await apiClient.get<PRListItem[]>(
      `${API_BASE_URL}/drafts`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getAllDrafts error:', error);
    throw error;
  }
};

/**
 * Get all submitted PRs (sent for approval)
 */
export const getAllSubmitted = async (): Promise<PRListItem[]> => {
  try {
    const response = await apiClient.get<PRListItem[]>(
      `${API_BASE_URL}/submitted`
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('getAllSubmitted error:', error);
    throw error;
  }
};

/**
 * Get PR by ID
 */
export const getPRById = async (id: number): Promise<PRDetail> => {
  try {
    const response = await apiClient.get<PRDetail>(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('getPRById error:', error);
    throw error;
  }
};

/**
 * Delete PR by ID
 */
export const deletePR = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`${API_BASE_URL}/${id}`);
  } catch (error) {
    console.error('deletePR error:', error);
    throw error;
  }
};

/**
 * Delete multiple PRs
 */
export const deletePRs = async (ids: number[]): Promise<void> => {
  try {
    // Sequential delete - backend doesn't support batch delete
    await Promise.all(ids.map(id => deletePR(id)));
  } catch (error) {
    console.error('deletePRs error:', error);
    throw error;
  }
};
