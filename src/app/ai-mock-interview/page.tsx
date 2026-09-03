import type { Metadata } from "next";
import AiMockInterviewClient from "./AiMockInterviewClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "AI Mock Interview",
  description: "Practice interviews with AI-powered feedback and evaluation.",
  openGraph: {
    title: `AI Mock Interview | ${siteName}`,
    description: "Practice interviews with AI-powered feedback and evaluation.",
  },
};

export default function AiMockInterviewPage() {
  return <AiMockInterviewClient />;
}