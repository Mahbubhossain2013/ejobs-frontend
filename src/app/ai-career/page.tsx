import type { Metadata } from "next";
import AiCareerClient from "./AiCareerClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "AI Career Coach",
  description:
    "Get personalized career guidance, salary predictions, and interview preparation powered by AI.",
  openGraph: {
    title: `AI Career Coach | ${siteName}`,
    description:
      "Get personalized career guidance and interview preparation powered by AI.",
  },
};

export default function AiCareerPage() {
  return <AiCareerClient />;
}
