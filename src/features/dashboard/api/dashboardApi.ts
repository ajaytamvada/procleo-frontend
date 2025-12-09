import { apiClient } from '@/lib/api';
import type { DashboardData } from '../types';

/**
 * Get comprehensive dashboard data
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await apiClient.get<DashboardData>('/dashboard');
  return response.data;
};
