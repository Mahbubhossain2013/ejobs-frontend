import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobAlertsService, JobAlertFormData } from "@/services/job-alerts.service";

export function useJobAlerts() {
  return useQuery({
    queryKey: ["job-alerts"],
    queryFn: jobAlertsService.getAlerts,
  });
}

export function useCreateJobAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: JobAlertFormData) => jobAlertsService.createAlert(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
    },
  });
}

export function useUpdateJobAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<JobAlertFormData> }) =>
      jobAlertsService.updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
    },
  });
}

export function useDeleteJobAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobAlertsService.deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
    },
  });
}

export function useToggleJobAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => jobAlertsService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["job-alerts"] });
    },
  });
}

export function usePreviewJobAlert(filters: Partial<JobAlertFormData>) {
  return useQuery({
    queryKey: ["job-alerts", "preview", filters],
    queryFn: () => jobAlertsService.previewMatches(filters),
    enabled: false,
  });
}
