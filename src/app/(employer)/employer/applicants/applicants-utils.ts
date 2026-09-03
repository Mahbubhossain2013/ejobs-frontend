import type { JobApplication } from "@/types";

export type JobGroup = {
  jobId: number;
  title: string;
  isRemote: boolean;
  budget: number | null;
  budgetType: string | null;
  job_type?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  deadline?: string;
  vacancies?: number;
  workplace_type?: string;
  description?: string;
  required_skills?: string[];
  experience_level?: string;
  applications: JobApplication[];
};

export async function tryEndpoints(attempts: (() => Promise<any>)[]): Promise<any> {
  let lastErr: any;
  for (const fn of attempts) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (err?.response?.status !== 404) throw err;
    }
  }
  throw lastErr;
}

export const ALL_STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "hired"] as const;

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  reviewed: "bg-blue-100 text-blue-800",
  shortlisted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  hired: "bg-green-100 text-green-800",
};

export const STATUS_LABELS: Record<string, { en: string; bn: string }> = {
  pending: { en: "Pending", bn: "পেন্ডিং" },
  reviewed: { en: "Reviewed", bn: "রিভিউ" },
  shortlisted: { en: "Shortlist", bn: "শর্টলিস্ট" },
  rejected: { en: "Reject", bn: "প্রত্যাখ্যান" },
  hired: { en: "Hire", bn: "নিয়োগ" },
};

export function getStatusLabel(s: string, isBn: boolean): string {
  const entry = STATUS_LABELS[s];
  return entry ? (isBn ? entry.bn : entry.en) : s;
}

export function getAvailableStatuses(current: string): string[] {
  return ALL_STATUSES.filter((s) => s !== current);
}

export function candidateLabel(app: JobApplication): string {
  return app.user?.name || "Candidate";
}

export function getProfileUrl(app: JobApplication): string | null {
  const username = (app as any).user?.username;
  const userId = (app as any).user?.id;
  if (username) return `/profile/${username}`;
  if (userId) return `/candidate/${userId}`;
  return null;
}

export function groupByJob(apps: JobApplication[]): JobGroup[] {
  const map = new Map<number, JobGroup>();
  for (const app of apps) {
    const jobId = app.job_id;
    const j = (app.job as any) || {};
    if (!map.has(jobId)) {
      map.set(jobId, {
        jobId,
        title: j.title || "Job",
        isRemote: !!j.is_remote_project,
        budget: j.budget ?? null,
        budgetType: j.budget_type ?? null,
        job_type: j.job_type,
        location: j.location,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        salary_type: j.salary_type,
        deadline: j.deadline,
        vacancies: j.vacancies,
        workplace_type: j.workplace_type,
        description: j.description,
        required_skills: Array.isArray(j.required_skills) ? j.required_skills : (typeof j.required_skills === 'string' ? j.required_skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        experience_level: j.experience_level,
        applications: [],
      });
    }
    map.get(jobId)!.applications.push(app);
  }
  return Array.from(map.values()).sort((a, b) => b.applications.length - a.applications.length);
}