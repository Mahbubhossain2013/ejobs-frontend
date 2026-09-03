import type { Metadata } from "next";
import EmployerCandidatesClient from "./EmployerCandidatesClient";

export const metadata: Metadata = {
  title: "Search Candidates",
  description: "Search and find candidates for your job positions",
};

export default function EmployerCandidatesPage() {
  return <EmployerCandidatesClient />;
}
