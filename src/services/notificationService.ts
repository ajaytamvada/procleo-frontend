import { api } from '@/lib/api';
import type { AppNotification } from '@/types/notification';

export const notificationService = {
    getUserNotifications: async (userId: string): Promise<AppNotification[]> => {
        // Endpoint matches NotificationController.getNotifications
        const response = await api.get<AppNotification[]>(`/notifications/list`, {
            params: { userId },
        });
        return response.data;
    },

    getUnreadCount: async (userId: string): Promise<number> => {
        // Endpoint matches NotificationController.getUnreadCount
        const response = await api.get<number>(`/notifications/unread-count`, {
            params: { userId },
        });
        return response.data;
    },

    markAsRead: async (id: number): Promise<void> => {
        // Endpoint matches NotificationController.markAsRead
        await api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: async (userId: string): Promise<void> => {
        // Endpoint matches NotificationController.markAllAsRead
        await api.put(`/notifications/mark-all-read`, null, {
            params: { userId },
        });
    },
};
