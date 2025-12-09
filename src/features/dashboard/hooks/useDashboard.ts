import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '../api/dashboardApi';

/**
 * Hook to fetch dashboard data
 */
export const useDashboardData = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardData(),
    staleTime: 60000, // 1 minute - dashboard data should be relatively fresh
    refetchInterval: 300000, // Auto-refresh every 5 minutes
  });
};
