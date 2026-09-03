import api from "@/lib/api-client";
import type { Conversation, Message, ApiResponse } from "@/types";

export const messagesService = {
  getConversations: async () => {
    const res = await api.get<ApiResponse<Conversation[]>>("/messages/inbox");
    return res.data.data;
  },

  getUnreadCount: async () => {
    const res = await api.get<ApiResponse<{ count: number }>>(
      "/messages/unread-count"
    );
    return res.data.data?.count ?? 0;
  },

  getMessages: async (uuid: string) => {
    const res = await api.get(`/messages/conversation/${uuid}`);
    return { messages: res.data.data, conversation: res.data.conversation };
  },

  sendMessage: async (uuid: string, body: string, file?: File) => {
    if (file) {
      const formData = new FormData();
      if (body) formData.append("message", body);
      formData.append("attachment", file);
      const res = await api.post(`/messages/conversation/${uuid}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }
    const res = await api.post(`/messages/conversation/${uuid}`, { message: body });
    return res.data;
  },

  blockUser: async (uuid: string) => {
    const res = await api.post(`/messages/conversation/${uuid}/block`);
    return res.data;
  },

  reportUser: async (uuid: string, reason: string) => {
    const res = await api.post(`/messages/conversation/${uuid}/report`, {
      reason,
    });
    return res.data;
  },
};
