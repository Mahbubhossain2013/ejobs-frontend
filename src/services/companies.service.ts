import api from "@/lib/api-client";
import type { Company, ApiResponse, PaginatedResponse } from "@/types";

export const companiesService = {
  getCompanies: async (page = 1, search = "") => {
    const res = await api.get<ApiResponse<PaginatedResponse<Company>>>(
      `/companies?page=${page}${search ? `&search=${encodeURIComponent(search)}` : ""}`
    );
    return res.data.data;
  },

  getFeaturedCompanies: async () => {
    const res = await api.get<ApiResponse<Company[]>>("/companies/featured");
    return res.data.data;
  },

  getCompanyBySlug: async (slug: string) => {
    const res = await api.get<ApiResponse<Company>>(`/companies/${slug}`);
    return res.data.data;
  },

  toggleFollow: async (companyId: number) => {
    const res = await api.post(`/candidate/companies/${companyId}/follow`);
    return res.data;
  },

  getCompanyReviews: async (companyId: number) => {
    const res = await api.get(`/companies/${companyId}/reviews`);
    // Laravel returns { status, data: { reviews: [...], averages: {...}, ... } }
    return res.data?.data ?? res.data;
  },

  submitReview: async (
    companyId: number,
    data: {
      rating: number;
      comment: string;
      is_anonymous?: boolean;
      rating_work_culture?: number;
      rating_salary?: number;
      rating_management?: number;
      rating_growth?: number;
      rating_work_life_balance?: number;
    }
  ) => {
    const res = await api.post(`/companies/${companyId}/reviews`, data);
    return res.data;
  },

  getCompanyBrochures: async (companyId: number) => {
    const res = await api.get(`/companies/${companyId}/brochures`);
    return res.data;
  },

  getCompanyAwards: async (companyId: number) => {
    const res = await api.get(`/companies/${companyId}/awards`);
    return res.data;
  },

  getCompanyCulturePhotos: async (companyId: number) => {
    const res = await api.get(`/companies/${companyId}/culture-photos`);
    return res.data;
  },
};