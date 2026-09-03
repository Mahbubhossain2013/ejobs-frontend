"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api-client";

export function useEmployerCompany() {
  const [company, setCompany] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [brochures, setBrochures] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [culturePhotos, setCulturePhotos] = useState<any[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<any[]>([]);
  const [activeJobs, setActiveJobs] = useState<any[]>([]);
  const [profileViews, setProfileViews] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [similarCompanies, setSimilarCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const fetchCompany = useCallback(async () => {
    try {
      setError(null);
      const res = await api.get("/employer/profile");
      const d = res.data?.data;
      if (d?.company) {
        setCompany(d.company);
        setStats(d.stats || null);
        setBrochures(d.brochures || []);
        setAwards(d.awards || []);
        setCulturePhotos(d.culture_photos || []);
        setRecentUpdates(d.recent_updates || []);
        setActiveJobs(d.active_jobs || []);
        setProfileViews(d.profile_views || 0);
        setFollowersCount(d.followers_count || 0);
        setReviewsCount(d.reviews_count || 0);
        setAvgRating(d.avg_rating || 0);
        setSimilarCompanies(d.similar_companies || []);
        setLastSyncedAt(new Date());
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load company data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompany();
    const handler = () => fetchCompany();
    if (typeof window !== "undefined") {
      window.addEventListener("employer-company-saved", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("employer-company-saved", handler);
      }
    };
  }, [fetchCompany]);

  const updateCompany = useCallback(async (formData: FormData): Promise<boolean> => {
    try {
      setSaving(true);
      setError(null);
      const res = await api.post("/employer/profile-update", formData);

        if (res.data?.status && res.data?.data?.company) {
          setCompany((prev: any) => ({ ...prev, ...res.data.data.company }));
        if (res.data.data.stats) setStats(res.data.data.stats);
        setLastSyncedAt(new Date());
        return true;
      }
      // Unexpected response shape
      if (res.data?.status === false || res.data?.status === undefined) {
        const msg = res.data?.message || "Server returned an unexpected response";
        setError(msg);
        throw new Error(msg);
      }
      return false;
    } catch (err: any) {
      const data = err.response?.data;
      let msg: string;

      if (data?.errors) {
        const firstKey = Object.keys(data.errors)[0];
        const val = data.errors[firstKey];
        msg = Array.isArray(val) ? val[0] : val;
      } else if (data?.message) {
        msg = data.message;
      } else if (err.response?.status === 500) {
        msg = "Server error occurred. Please try again or contact support.";
      } else if (err.response?.status === 413) {
        msg = "File too large. Maximum size is 400KB.";
      } else {
        msg = err.message || "Failed to save profile";
      }

      setError(msg);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const getDisplayField = useCallback(
    (dbField: string, fallback = ""): string => {
      if (!company) return fallback;
      const val = company[dbField];
      return val != null && val !== "" ? String(val) : fallback;
    },
    [company]
  );

  return {
    company,
    stats,
    brochures,
    awards,
    culturePhotos,
    recentUpdates,
    activeJobs,
    profileViews,
    followersCount,
    reviewsCount,
    avgRating,
    similarCompanies,
    loading,
    saving,
    error,
    lastSyncedAt,
    refetch: fetchCompany,
    updateCompany,
    getDisplayField,
  };
}