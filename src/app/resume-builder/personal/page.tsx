"use client";

import dynamic from "next/dynamic";

const ResumeWizardClient = dynamic(() => import("../ResumeWizardClient"), { ssr: false });

export default function PersonalPage() {
  return <ResumeWizardClient />;
}