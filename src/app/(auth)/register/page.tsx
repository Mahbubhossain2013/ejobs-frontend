import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Register",
  description: `Create your ${siteName} account and start your career journey.`,
};

export default function RegisterPage() {
  return <RegisterClient />;
}
