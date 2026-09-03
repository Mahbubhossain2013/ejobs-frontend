import SkillsClient from "./SkillsClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata = {
  title: `Skill Center | ${siteName}`,
  description: `Professional skill training courses powered by ${siteName}. Get certified and boost your career`,
};

export default function SkillsPage() {
  return <SkillsClient />;
}
