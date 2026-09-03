"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsService } from "@/services/jobs.service";
import { useAuthStore } from "@/store/auth-store";
import type { SearchFilters } from "@/types";
import { toast } from "sonner";
import { trackBehavior } from "@/hooks/use-behavior-tracker";

export function useJobs(filters?: SearchFilters) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobsService.getJobs(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useJob(id: number | string) {
  return useQuery({
    queryKey: ["jobs", id],
    queryFn: () => jobsService.getJobById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useRemoteJobs(page = 1) {
  return useQuery({
    queryKey: ["jobs", "remote", page],
    queryFn: () => jobsService.getRemoteJobs(page),
    staleTime: 2 * 60 * 1000,
  });
}

export function useRecommendedJobs(enabled = true) {
  const role = useAuthStore((s) => s.role);
  return useQuery({
    queryKey: ["jobs", "recommended"],
    queryFn: jobsService.getRecommendedJobs,
    enabled: enabled && role === "candidate",
    staleTime: 5 * 60 * 1000,
  });
}

export function useSavedJobs(enabled = true) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["jobs", "saved"],
    queryFn: jobsService.getSavedJobs,
    enabled: enabled && !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAppliedJobs() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["jobs", "applied"],
    queryFn: jobsService.getAppliedJobs,
    enabled: !!token,
    staleTime: 2 * 60 * 1000,
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      jobId,
      data,
    }: {
      jobId: number;
      data?: { cover_letter?: string; portfolio_link?: string };
    }) => jobsService.applyToJob(jobId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "applied"] });
      trackBehavior("application", { metaData: { timestamp: Date.now() } });
      toast.success("Application submitted successfully!");
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Failed to apply");
    },
  });
}

export function useToggleSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (jobId: number) => jobsService.toggleSaveJob(jobId),
    onSuccess: (_data: any, jobId: number) => {
      queryClient.invalidateQueries({ queryKey: ["jobs", "saved"] });
      trackBehavior("job_save", { targetId: jobId, metaData: { timestamp: Date.now() } });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Failed to save job";
      toast.error(msg);
    },
  });
}

export function useAiMatchScore(jobId: number) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["jobs", jobId, "ai-match"],
    queryFn: () => jobsService.getAiMatchScore(jobId),
    enabled: !!jobId && !!token,
    retry: 1,
    staleTime: 10 * 60 * 1000,
  });
}
