import type { Metadata } from "next";
import VerifyEmailClient from "./VerifyEmailClient";

const siteName = process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

export const metadata: Metadata = {
  title: "Email Verification",
  description: `Verify your email address to activate your ${siteName} account.`,
};

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}
