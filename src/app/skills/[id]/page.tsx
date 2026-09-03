import SkillDetailClient from "./SkillDetailClient";

export function generateStaticParams() {
  return [{ id: "__placeholder__" }];
}

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata = {
  title: `Course Details | Skill Center - ${siteName}`,
};

export default function SkillDetailPage() {
  return <SkillDetailClient />;
}
