import type { Metadata } from "next";
import ResumeScoreClient from "./ResumeScoreClient";

export const metadata: Metadata = {
  title: "Resume Score Checker - Free",
  description: "Check your resume score for free. Get instant feedback on 25+ parameters and improve your CV.",
};

export default function ResumeScorePage() {
  return <ResumeScoreClient />;
}
