import type { Metadata } from "next";
import JobDetailClient from "./JobDetailClient";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://admin.ejobs.bd/api";
const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
const API_URL = cleanApiUrl.endsWith("/api") ? cleanApiUrl : `${cleanApiUrl}/api`;

export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

export const dynamicParams = true;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchJob(id: string) {
  if (!id || id === "__placeholder__") return null;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(`${API_URL}/jobs/${id}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id || id === "__placeholder__") {
    return {
      title: "Job Details | eJobs",
      description: "Find your dream job or apply online on eJobs.",
    };
  }

  const job = await fetchJob(id);

  if (!job) {
    return {
      title: "Job Details | eJobs",
      description: "Find your dream job or apply online on eJobs.",
    };
  }

  const title = job.title || `Job #${id}`;
  const company = job.company?.name || job.company_name || "";
  const location = job.location || "";
  const description = job.description
    ? job.description.replace(/<[^>]*>/g, "").slice(0, 160)
    : `Apply for ${title}${company ? ` at ${company}` : ""}${location ? ` in ${location}` : ""}`;

  const fullTitle = company ? `${title} at ${company} | eJobs` : `${title} | eJobs`;

  return {
    title: fullTitle,
    description,
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <JobDetailClient jobId={id} />;
}
