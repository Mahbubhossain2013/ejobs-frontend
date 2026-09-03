import { redirect } from "next/navigation";

export default async function DashboardResumeBuilderCatchAll({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolved = await params;
  const slugPath = resolved?.slug ? resolved.slug.join("/") : "template";
  redirect(`/resume-builder/${slugPath}`);
}
