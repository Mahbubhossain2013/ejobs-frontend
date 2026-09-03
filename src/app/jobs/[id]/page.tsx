import type { Metadata } from "next";
import JobDetailClient from "./JobDetailClient";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
const API_URL = cleanApiUrl.endsWith("/api") ? cleanApiUrl : `${cleanApiUrl}/api`;

export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

async function fetchJob(id: string) {
  try {
    const res = await fetch(`${API_URL}/jobs/${id}`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await fetchJob(id);

  if (!job) {
    return {
      title: "Job Not Found",
      description: "This job listing could not be found or may have been removed.",
    };
  }

  const title = job.title || `Job #${id}`;
  const company = job.company?.name || job.company_name || "";
  const location = job.location || "";
  const description = job.description
    ? job.description.replace(/<[^>]*>/g, "").slice(0, 160)
    : `Apply for ${title}${company ? ` at ${company}` : ""}${location ? ` in ${location}` : ""}`;

  const fullTitle = company ? `${title} at ${company}` : title;

  return {
    title: fullTitle,
    description,
  };
}

export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <JobDetailClient jobId={id} />;
}
