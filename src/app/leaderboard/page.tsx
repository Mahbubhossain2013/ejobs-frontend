import type { Metadata } from "next";
import LeaderboardClient from "./LeaderboardClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: `Top candidates and employers on ${siteName}.bd.`,
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
