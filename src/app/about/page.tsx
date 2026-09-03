import type { Metadata } from "next";
import AboutClient from "./AboutClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "About Us",
  description:
    `Learn about ${siteName}.bd — Bangladesh's leading AI-powered job portal connecting talented professionals with top employers.`,
};

export default function AboutPage() {
  return <AboutClient />;
}
