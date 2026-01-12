import { api } from '@/lib/api';
import type { UserActivity } from '@/types/activity';

export const activityService = {
  getRecentActivities: async (userId: string): Promise<UserActivity[]> => {
    // Endpoint matches UserActivityController.getRecentActivities
    const response = await api.get<UserActivity[]>(`/activity/recent`, {
      params: { userId },
    });
    // api.get returns data directly at runtime, cast to fix type mismatch
    return (response as unknown as UserActivity[]) || [];
  },
};
