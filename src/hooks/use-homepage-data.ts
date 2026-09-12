"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";

async function fetchWithRetry<T>(url: string, retries = 2, delayMs = 1000): Promise<T | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await api.get(url);
      return res.data?.data ?? null;
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
      }
    }
  }
  return null;
}

export function useHomepageData() {
  const homepageQuery = useQuery({
    queryKey: ["homepage"],
    queryFn: () => fetchWithRetry<any>("/homepage/data"),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const raw = homepageQuery.data ?? {};
  const categories = Array.isArray(raw.categories) ? raw.categories : [];
  const companies = Array.isArray(raw.companies) ? raw.companies : [];
  const notices = Array.isArray(raw.notices) ? raw.notices.slice(0, 5) : [];
  const featuredJobs = Array.isArray(raw.featured_jobs) ? raw.featured_jobs.slice(0, 30) : [];
  const remoteJobs = Array.isArray(raw.remote_jobs) ? raw.remote_jobs.slice(0, 30) : [];
  const hotJobs = Array.isArray(raw.hot_jobs) ? raw.hot_jobs.slice(0, 30) : (Array.isArray(raw.featured_jobs) ? raw.featured_jobs.slice(0, 30) : []);
  const hpData = raw.settings ?? {};
  const loading = homepageQuery.isLoading;

  return {
    categories,
    categoriesLoading: loading,
    categoriesError: homepageQuery.isError,
    companies,
    notices,
    jobs: featuredJobs,
    hpData,
    hotJobs,
    remoteJobs,
    loading,
  };
}
