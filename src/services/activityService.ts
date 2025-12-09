import { api } from '@/lib/api';
import type { UserActivity } from '@/types/activity';

export const activityService = {
    getRecentActivities: async (userId: string): Promise<UserActivity[]> => {
        // Endpoint matches UserActivityController.getRecentActivities
        const response = await api.get<UserActivity[]>(`/activity/recent`, {
            params: { userId },
        });
        return response.data;
    },
};
