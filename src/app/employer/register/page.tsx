import type { Metadata } from "next";
import EmployerRegisterClient from "@/app/(auth)/employer-register/EmployerRegisterClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Employer Registration",
  description: `Register as an employer on ${siteName} and start hiring.`,
};

export default function EmployerRegisterPage() {
  return <EmployerRegisterClient />;
}
