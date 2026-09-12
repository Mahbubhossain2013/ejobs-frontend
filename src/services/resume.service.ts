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

export const DEFAULT_FALLBACK_TEMPLATES: CvTemplate[] = [
  { id: 10, name: "Sidebar Pro", slug: "sidebar-pro", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 12, name: "Executive", slug: "executive", category: "executive", is_premium: true, price: 150, download_count: 0 },
  { id: 14, name: "Modern Two-Column", slug: "modern-twocol", category: "modern", is_premium: false, price: 0, download_count: 0 },
  { id: 15, name: "Creative Pro", slug: "creative-pro", category: "creative", is_premium: true, price: 250, download_count: 0 },
  { id: 16, name: "Minimal Elegant", slug: "minimal-elegant", category: "minimal", is_premium: false, price: 0, download_count: 0 },
  { id: 17, name: "Bold Professional", slug: "bold-professional", category: "professional", is_premium: true, price: 150, download_count: 0 },
  { id: 18, name: "Sleek Financial Consultant Bio", slug: "sleek-financial", category: "executive", is_premium: false, price: 0, download_count: 0 },
  { id: 19, name: "Architect Manager", slug: "architect-manager", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 20, name: "Teacher Resume", slug: "teacher-resume", category: "academic", is_premium: false, price: 0, download_count: 0 },
  { id: 21, name: "Project Manager Resume", slug: "project-manager", category: "executive", is_premium: false, price: 0, download_count: 0 },
  { id: 22, name: "Journalist Photographer Resume", slug: "journalist-photographer", category: "creative", is_premium: false, price: 0, download_count: 0 },
  { id: 23, name: "Fashion Designer Resume", slug: "fashion-designer", category: "creative", is_premium: false, price: 0, download_count: 0 },
  { id: 25, name: "Developer Resume", slug: "developer-resume", category: "technical", is_premium: false, price: 0, download_count: 0 },
  { id: 26, name: "Interior Design Resume", slug: "interior-design", category: "creative", is_premium: false, price: 0, download_count: 0 },
  { id: 27, name: "Sales Manager Resume", slug: "sales-manager", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 28, name: "Analyst Resume", slug: "analyst-resume", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 29, name: "Photographer Resume", slug: "photographer-resume", category: "creative", is_premium: false, price: 0, download_count: 0 },
  { id: 31, name: "Manager Resume", slug: "manager-pastel", category: "modern", is_premium: false, price: 0, download_count: 0 },
  { id: 32, name: "Business Analyst Resume", slug: "business-analyst", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 33, name: "Business Administrator Resume", slug: "business-administrator", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 34, name: "Social Media Specialist Resume", slug: "social-media-specialist", category: "modern", is_premium: false, price: 0, download_count: 0 },
  { id: 35, name: "UI UX Developer Resume", slug: "ui-ux-developer", category: "technical", is_premium: false, price: 0, download_count: 0 },
  { id: 36, name: "Modern Noir Curve", slug: "black-curved-modern", category: "technical", is_premium: false, price: 0, download_count: 0 },
  { id: 37, name: "Black & Amber Duo", slug: "black-orange-duo", category: "creative", is_premium: false, price: 0, download_count: 0 },
  { id: 38, name: "Navy Gold Executive", slug: "navy-gold-executive", category: "executive", is_premium: false, price: 0, download_count: 0 },
  { id: 39, name: "Three Band Horizon", slug: "three-band-horizontal", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 40, name: "Editorial Taupe Wave", slug: "curved-taupe-minimal", category: "modern", is_premium: false, price: 0, download_count: 0 },
  { id: 41, name: "Charcoal Ribbon Executive", slug: "dark-charcoal-ribbon", category: "creative", is_premium: false, price: 0, download_count: 0 },
  { id: 42, name: "Corporate Monochrome Pro", slug: "corporate-monochrome-pro", category: "professional", is_premium: false, price: 0, download_count: 0 },
  { id: 43, name: "Arch Ribbon Modern", slug: "arch-ribbon-grey", category: "modern", is_premium: false, price: 0, download_count: 0 },
  { id: 44, name: "Cyan Ocean Wave", slug: "cyan-ocean-wave", category: "creative", is_premium: false, price: 0, download_count: 0 },
  { id: 45, name: "Red Slate Executive Dual", slug: "red-slate-executive", category: "executive", is_premium: false, price: 0, download_count: 0 },
  { id: 46, name: "Yellow Executive Card", slug: "yellow-executive-card", category: "Modern", is_premium: false, price: 0, download_count: 0 },
  { id: 47, name: "Orange Creative Contrast", slug: "orange-contrast-grid", category: "Creative", is_premium: false, price: 0, download_count: 0 },
];

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
  getTemplates: async (): Promise<CvTemplate[]> => {
    try {
      const res = await api.get<ApiResponse<CvTemplate[]>>("/cv/templates/public");
      const list = ((res.data.data ?? res.data) ?? []) as CvTemplate[];
      const removedSlugs = ["medical-pro", "academic", "corporate-clean", "graphic-designer", "social-media-manager"];
      const filtered = list.filter((t) => !removedSlugs.includes(t.slug));
      if (filtered.length > 0) return filtered;
    } catch (e) {
      console.warn("api.get templates failed, trying direct fetch:", e);
    }

    try {
      const res = await fetch("https://admin.ejobs.bd/api/cv/templates/public");
      const json = await res.json();
      const list = (json.data ?? json ?? []) as CvTemplate[];
      const removedSlugs = ["medical-pro", "academic", "corporate-clean", "graphic-designer", "social-media-manager"];
      const filtered = list.filter((t) => !removedSlugs.includes(t.slug));
      if (filtered.length > 0) return filtered;
    } catch (e) {
      console.warn("Direct fetch to admin.ejobs.bd failed, using fallback:", e);
    }

    return DEFAULT_FALLBACK_TEMPLATES;
  },

  trackTemplateDownload: async (slug: string) => {
    try {
      const res = await api.post<ApiResponse<{ download_count: number }>>(
        `/cv/templates/${slug}/track-download`
      );
      return res.data;
    } catch {
      return null;
    }
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