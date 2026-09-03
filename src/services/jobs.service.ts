import api from "@/lib/api-client";
import type {
  Job,
  ApiResponse,
  PaginatedResponse,
  SearchFilters,
} from "@/types";

export const jobsService = {
  getJobs: async (filters?: SearchFilters) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });
    }
    const res = await api.get<ApiResponse<PaginatedResponse<Job>>>(
      `/jobs?${params.toString()}`
    );
    return res.data.data;
  },

  getJobById: async (id: number | string) => {
    const res = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return res.data.data;
  },

  getRemoteJobs: async (page = 1) => {
    const res = await api.get<ApiResponse<PaginatedResponse<Job>>>(
      `/jobs/remote?page=${page}`
    );
    return res.data.data;
  },

  getRecommendedJobs: async () => {
    const res = await api.get<ApiResponse<Job[]>>("/candidate/recommended-jobs");
    return res.data.data;
  },

  applyToJob: async (
    jobId: number,
    data?: { cover_letter?: string; portfolio_link?: string }
  ) => {
    const res = await api.post(`/candidate/jobs/${jobId}/apply`, data);
    return res.data;
  },

  toggleSaveJob: async (jobId: number) => {
    const res = await api.post(`/candidate/toggle-save/${jobId}`);
    return res.data;
  },

  getSavedJobs: async () => {
    const res = await api.get("/candidate/saved-jobs");
    const payload = res.data.data;
    // Handle paginated response: { data: [...], current_page, last_page, total }
    if (Array.isArray(payload)) return payload;
    if (payload?.data) return payload.data;
    return [];
  },

  getAppliedJobs: async () => {
    const res = await api.get("/candidate/applied-jobs");
    const payload = res.data.data;
    // Handle paginated response: { data: [...], current_page, last_page, total }
    if (Array.isArray(payload)) return payload;
    if (payload?.data) return payload.data;
    return [];
  },

  getAiMatchScore: async (jobId: number) => {
    const res = await api.get<ApiResponse<any>>(
      `/candidate/jobs/${jobId}/ai-match`
    );
    return res.data.data;
  },

  getJobAiInsights: async (jobId: number) => {
    const res = await api.get(`/jobs/${jobId}/ai-insights`);
    return res.data;
  },
};
