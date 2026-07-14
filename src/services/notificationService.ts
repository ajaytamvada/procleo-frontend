import { apiClient } from '@/lib/api';
import type { AppNotification } from '@/types/notification';

/**
 * Uses the JWT principal-scoped `/notifications/me*` endpoints: the recipient is
 * resolved from the auth token server-side, so no userId is sent from the client
 * (this closes the previous IDOR where any user could pass another user's id).
 *
 * Uses the raw `apiClient` axios instance because these endpoints return their
 * payload directly (a page object / a { count } object), not the { data } envelope
 * the `api` wrapper unwraps.
 */
export const notificationService = {
  getMyNotifications: async (
    unreadOnly = false,
    page = 0,
    size = 30
  ): Promise<AppNotification[]> => {
    const res = await apiClient.get(`/notifications/me`, {
      params: { unread: unreadOnly, page, size },
    });
    const content = res.data?.content;
    return Array.isArray(content) ? content : [];
  },

  getMyUnreadCount: async (): Promise<number> => {
    const res = await apiClient.get(`/notifications/me/unread-count`);
    const count = res.data?.count;
    return typeof count === 'number' ? count : 0;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/me/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put(`/notifications/me/mark-all-read`);
  },
};
