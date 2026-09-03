import api from "@/lib/api-client";

export const notificationsService = {
  getNotifications: async (page = 1) => {
    const res = await api.get(`/notifications?page=${page}`);
    return res.data; // { status, data: [...], unread_count }
  },

  markAsRead: async (id: number) => {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.post("/notifications/read-all");
    return res.data;
  },

  bulkRead: async (ids: number[]) => {
    const res = await api.post("/notifications/bulk-read", { ids });
    return res.data;
  },
};
