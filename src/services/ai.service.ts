import api from "@/lib/api-client";
import type { CvProfile, ApiResponse } from "@/types";

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface CareerRoadmap {
  current_level: string;
  target_role: string;
  steps: {
    title: string;
    description: string;
    duration: string;
    resources: string[];
  }[];
}

export interface SalaryPrediction {
  predicted_salary: number;
  currency: string;
  confidence: number;
  factors: string[];
}

export const aiService = {
  chat: async (message: string, context?: string) => {
    const res = await api.post("/ai/chat", { message, context });
    return res.data;
  },

  generateCvProfile: async (prompt: string) => {
    const res = await api.post<ApiResponse<CvProfile>>(
      "/candidate/ai/generate-cv-profile",
      { prompt }
    );
    return res.data.data;
  },

  rewriteAchievement: async (text: string) => {
    const res = await api.post("/candidate/cv/ai/rewrite-achievement", {
      text,
    });
    return res.data;
  },

  computeAtsScore: async (cvData: CvProfile) => {
    const res = await api.post("/candidate/cv/ai/ats-score", cvData);
    return res.data;
  },

  generateJobDescription: async (data: {
    title: string;
    requirements?: string;
  }) => {
    const res = await api.post("/employer/ai/generate-description", data);
    return res.data;
  },

  getCareerRoadmap: async (prompt?: string, regenerate?: boolean) => {
    const params: any = {};
    if (prompt) params.prompt = prompt;
    if (regenerate) params.regenerate = true;
    const res = await api.get<ApiResponse<CareerRoadmap>>("/ai/career-roadmap", { params });
    return res.data.data;
  },

  getSalaryPrediction: async (params?: {
    role?: string;
    location?: string;
    experience?: number;
  }) => {
    const res = await api.get<ApiResponse<SalaryPrediction>>("/ai/salary-predict", {
      params,
    });
    return res.data.data;
  },

  startInterview: async (data: { role: string; difficulty?: string }) => {
    const res = await api.post("/ai/interview/start", data);
    return res.data;
  },

  evaluateInterview: async (data: {
    session_id: string;
    answers: { question: string; answer: string }[];
  }) => {
    const res = await api.post("/ai/interview/evaluate", data);
    return res.data.data;
  },

  generateCoverLetter: async (data: { job_title: string; company_name: string; job_description?: string; candidate_name?: string }) => {
    const res = await api.post("/ai/generate-cover-letter", data);
    return res.data;
  },
};
