import { headers } from "next/headers";
import ResumeWizardClient from "../ResumeWizardClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function TemplatePage() {
  const h = await headers();
  return <ResumeWizardClient />;
}