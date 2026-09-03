import api from "@/lib/api-client";

export interface JobAlert {
  id: number;
  user_id: number;
  label: string | null;
  keywords: string | null;
  category_id: number | null;
  category?: { id: number; name: string };
  job_type: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  is_remote: boolean | null;
  frequency: "daily" | "weekly" | "instant";
  is_active: boolean;
  last_sent_at: string | null;
  created_at: string;
}

export interface JobAlertFormData {
  label?: string;
  keywords?: string;
  category_id?: number;
  job_type?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  is_remote?: boolean;
  frequency: "daily" | "weekly" | "instant";
}

export const jobAlertsService = {
  getAlerts: async (): Promise<JobAlert[]> => {
    const res = await api.get("/candidate/job-alerts");
    return res.data.data;
  },

  createAlert: async (data: JobAlertFormData): Promise<JobAlert> => {
    const res = await api.post("/candidate/job-alerts", data);
    return res.data.data;
  },

  updateAlert: async (
    id: number,
    data: Partial<JobAlertFormData>
  ): Promise<JobAlert> => {
    const res = await api.put(`/candidate/job-alerts/${id}`, data);
    return res.data.data;
  },

  deleteAlert: async (id: number): Promise<void> => {
    await api.delete(`/candidate/job-alerts/${id}`);
  },

  toggleActive: async (id: number): Promise<JobAlert> => {
    const res = await api.post(`/candidate/job-alerts/${id}/toggle`);
    return res.data.data;
  },

  previewMatches: async (
    filters: Partial<JobAlertFormData>
  ): Promise<number> => {
    const res = await api.get("/candidate/job-alerts/preview", { params: filters });
    return res.data.match_count;
  },
};
