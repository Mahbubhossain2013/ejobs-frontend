import api from "@/lib/api-client";
import type { ApiResponse, PaginatedResponse, Interview } from "@/types";

export const interviewService = {
  // Employer
  scheduleInterview: async (applicationId: number, data: {
    type: string;
    scheduled_at: string;
    duration_minutes: number;
    location?: string;
    notes?: string;
  }) => {
    const res = await api.post<ApiResponse<Interview>>(`/employer/interviews/${applicationId}`, data);
    return res.data;
  },

  getEmployerInterviews: async (params?: { status?: string; page?: number }) => {
    const res = await api.get<ApiResponse<PaginatedResponse<Interview>>>("/employer/interviews", { params });
    return res.data;
  },

  updateInterviewStatus: async (interviewId: number, data: { status: string; outcome?: string }) => {
    const res = await api.put<ApiResponse<Interview>>(`/employer/interviews/${interviewId}/status`, data);
    return res.data;
  },

  getAcceptedJobs: async () => {
    const res = await api.get<ApiResponse<any[]>>("/employer/accepted-jobs");
    return res.data;
  },

  // Candidate
  getCandidateInterviews: async (params?: { status?: string; page?: number }) => {
    const res = await api.get<ApiResponse<PaginatedResponse<Interview>>>("/candidate/interviews", { params });
    return res.data;
  },

  respondToInterview: async (interviewId: number, data: { candidate_response: string; candidate_note?: string }) => {
    const res = await api.post<ApiResponse<Interview>>(`/candidate/interviews/${interviewId}/respond`, data);
    return res.data;
  },
};
