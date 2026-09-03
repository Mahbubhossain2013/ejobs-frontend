import api from "@/lib/api-client";
import type { CvProfile, CvTemplate, Resume, ApiResponse } from "@/types";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://admin.ejobs.bd").replace(/\/api\/?$/, "");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    return JSON.parse(raw)?.state?.token || null;
  } catch { return null; }
}

export const resumeService = {
  // Profile
  getProfile: async () => {
    const res = await api.get<ApiResponse<CvProfile>>("/candidate/cv/profile");
    return (res.data.data ?? res.data) as CvProfile;
  },

  updateProfile: async (data: CvProfile) => {
    const res = await api.post<ApiResponse<CvProfile>>(
      "/candidate/cv/profile/update",
      data
    );
    return res.data;
  },

  getProfileStrength: async () => {
    const res = await api.get<ApiResponse<any>>("/candidate/profile-strength");
    return res.data.data ?? res.data;
  },

  getResumes: async () => {
    const res = await api.get<ApiResponse<Resume[]>>("/candidate/cv/resumes");
    return ((res.data.data ?? res.data) ?? []) as Resume[];
  },

  // Templates
  getTemplates: async () => {
    const res = await api.get<ApiResponse<CvTemplate[]>>(
      "/cv/templates/public"
    );
    return ((res.data.data ?? res.data) ?? []) as CvTemplate[];
  },

  // Resumes
  createResume: async (data: { title: string; template_slug: string; data_snapshot?: any }) => {
    const res = await api.post<ApiResponse<Resume>>(
      "/candidate/cv/resumes",
      data
    );
    return (res.data.data ?? res.data) as Resume;
  },

  getResume: async (uuid: string) => {
    const res = await api.get<ApiResponse<Resume>>(
      `/candidate/cv/resumes/${uuid}`
    );
    return (res.data.data ?? res.data) as Resume;
  },

  updateResume: async (uuid: string, data: Partial<Resume>) => {
    const res = await api.put<ApiResponse<Resume>>(
      `/candidate/cv/resumes/${uuid}`,
      data
    );
    return (res.data.data ?? res.data) as Resume;
  },

  deleteResume: async (uuid: string) => {
    const res = await api.delete(`/candidate/cv/resumes/${uuid}`);
    return res.data;
  },

  downloadResume: async (uuid: string): Promise<Blob> => {
    const res = await api.get(`/candidate/cv/resumes/${uuid}/download`, {
      responseType: "blob",
    });
    return res.data;
  },

  duplicateResume: async (uuid: string) => {
    const res = await api.post(`/candidate/cv/resumes/${uuid}/duplicate`);
    return res.data;
  },

  shareResume: async (
    uuid: string,
    data: { is_public: boolean; password?: string; expires_at?: string }
  ) => {
    const res = await api.post(`/candidate/cv/resumes/${uuid}/share`, data);
    return res.data;
  },

  // AI CV Generation (subscription-gated)
  generateWithAi: async (prompt: string) => {
    const res = await api.post<ApiResponse<any>>(
      "/candidate/cv/generate-ai",
      { prompt }
    );
    return res.data;
  },

  // Get shareable link
  getShareLink: async (uuid: string) => {
    const res = await api.get<ApiResponse<{ share_url: string; uuid: string; is_public: boolean }>>(
      `/candidate/cv/${uuid}/share`
    );
    return (res.data.data ?? res.data) as { share_url: string; uuid: string; is_public: boolean };
  },

  // Download PDF — server-side proxy handles auth + PDF generation
  downloadPdf: async (uuid: string): Promise<Blob> => {
    const token = getToken();
    const url = token
      ? `${API_BASE}/cv/download/${uuid}?token=${encodeURIComponent(token)}`
      : `${API_BASE}/cv/download/${uuid}`;

    const proxyRes = await fetch(url, {
      signal: AbortSignal.timeout(45000),
    });

    if (proxyRes.ok) {
      const ct = proxyRes.headers.get("content-type") || "";
      const blob = await proxyRes.blob();
      if (blob.size > 100 && (ct.includes("pdf") || ct.includes("octet-stream"))) {
        return blob;
      }
    }

    const errorBody = await proxyRes.json().catch(() => null);
    throw new Error(errorBody?.error || "PDF download failed");
  },

  // Upload PDF CV
  uploadResume: async (formData: FormData): Promise<{ resume_path: string; resume_url: string }> => {
    const res = await api.post<ApiResponse<{ resume_path: string; resume_url: string }>>(
      "/candidate/resume-upload",
      formData
    );
    return (res.data.data ?? res.data) as { resume_path: string; resume_url: string };
  },

  // Select CV Builder Resume as Active
  selectResume: async (resumeUuid: string) => {
    const res = await api.post<ApiResponse<{ resume_path: string; resume_url: string }>>(
      "/candidate/resume-upload",
      { resume_uuid: resumeUuid }
    );
    return res.data.data ?? res.data;
  },

  // Update Profile Privacy
  updateProfilePrivacy: async (isPublic: boolean) => {
    const res = await api.post<ApiResponse<any>>(
      "/candidate/profile-update",
      { is_public: isPublic }
    );
    return res.data.data ?? res.data;
  },

  // Render preview from resume's data_snapshot (uses frozen data, not live profile)
  renderPreview: async (uuid: string): Promise<string> => {
    const res = await api.get(`/cv/resumes/${uuid}/preview`, { responseType: "text" });
    return res.data;
  },

  // Get live preview with actual user profile data (auth required)
  getLivePreview: async (slug: string): Promise<string> => {
    const res = await api.get(`/candidate/cv/live-preview/${slug}`, { responseType: "text" });
    return res.data;
  },

  // Get live preview merging current editor data over DB data (POST)
  getLivePreviewWithData: async (slug: string, data: Record<string, any>): Promise<string> => {
    const res = await api.post(`/candidate/cv/live-preview/${slug}`, { data }, { responseType: "text" });
    return res.data;
  },

  // Get template demo preview HTML (public, no auth)
  getPreviewDemo: async (slug: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/cv/demo/${slug}`);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `Preview failed (${res.status})`);
    }
    return res.text();
  },
};