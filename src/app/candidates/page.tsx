import type { Metadata } from "next";
import CandidatesClient from "./CandidatesClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Browse Candidates",
  description: `Discover talented candidates available for hire on ${siteName}.`,
};

export default function CandidatesPage() {
  return <CandidatesClient />;
}
