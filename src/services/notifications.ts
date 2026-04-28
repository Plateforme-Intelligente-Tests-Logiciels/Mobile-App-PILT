import { NotificationResponse } from "@/types/api";
import { apiClient, handleApiError } from "./api";

export interface NotificationUnreadCountResponse {
  count?: number;
  unread_count?: number;
  total?: number;
}

export interface NotificationMarkAllReadResponse {
  message?: string;
  count?: number;
}

const BASE_URL = "/notifications";

export const notificationsService = {
  async listMyNotifications(
    unreadOnly = false,
    limit = 20,
  ): Promise<NotificationResponse[]> {
    try {
      const res = await apiClient.get<NotificationResponse[]>(
        `${BASE_URL}/me`,
        {
          params: { unread_only: unreadOnly, limit },
        },
      );
      return res.data ?? [];
    } catch (e) {
      handleApiError(e);
    }
  },

  async getUnreadNotificationsCount(): Promise<NotificationUnreadCountResponse> {
    try {
      const res = await apiClient.get<NotificationUnreadCountResponse>(
        `${BASE_URL}/me/unread-count`,
      );
      return res.data ?? {};
    } catch (e) {
      handleApiError(e);
    }
  },

  async markNotificationAsRead(
    notificationId: number,
  ): Promise<NotificationResponse> {
    try {
      const res = await apiClient.patch<NotificationResponse>(
        `${BASE_URL}/${notificationId}/read`,
      );
      return res.data;
    } catch (e) {
      handleApiError(e);
    }
  },

  async markAllNotificationsAsRead(): Promise<NotificationMarkAllReadResponse> {
    try {
      const res = await apiClient.patch<NotificationMarkAllReadResponse>(
        `${BASE_URL}/me/read-all`,
      );
      return res.data ?? {};
    } catch (e) {
      handleApiError(e);
    }
  },
};
