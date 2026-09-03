import type { Metadata } from "next";
import JobsListClient from "./JobsListClient";

export const metadata: Metadata = {
  title: "All Jobs",
  description:
    "Browse thousands of job listings across multiple categories. Find your dream job with AI-powered matching.",
};

export default function JobsPage() {
  return <JobsListClient />;
}
